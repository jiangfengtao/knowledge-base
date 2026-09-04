import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";

// 获取所有标签（树形结构）
export async function GET() {
  try {
    const user = await getDefaultUser();
    
    // 查询所有标签，包含子标签和关联数量
    const tags = await prisma.tag.findMany({
      where: { userId: user.id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        children: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          include: {
            children: {
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              include: {
                _count: {
                  select: {
                    notes: true,
                    documents: true,
                  },
                },
              },
            },
            _count: {
              select: {
                notes: true,
                documents: true,
              },
            },
          },
        },
        _count: {
          select: {
            notes: true,
            documents: true,
          },
        },
      },
    });

    // 只返回顶层标签（没有 parentId 的）
    const rootTags = tags.filter((t) => !t.parentId);

    return NextResponse.json({
      success: true,
      data: rootTags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        sortOrder: tag.sortOrder,
        count: tag._count.notes + tag._count.documents,
        children: tag.children.map((child) => ({
          id: child.id,
          name: child.name,
          color: child.color,
          sortOrder: child.sortOrder,
          count: child._count.notes + child._count.documents,
          children: child.children.map((gc) => ({
            id: gc.id,
            name: gc.name,
            color: gc.color,
            sortOrder: gc.sortOrder,
            count: gc._count.notes + gc._count.documents,
          })),
        })),
      })),
    });
  } catch (error: any) {
    console.error("获取标签失败:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 创建标签（支持子标签）
export async function POST(request: Request) {
  try {
    const user = await getDefaultUser();
    const body = await request.json();
    const { name, color, parentId, sortOrder } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "标签名不能为空" },
        { status: 400 }
      );
    }

    // 检查同级下是否已有同名标签
    const existing = await prisma.tag.findFirst({
      where: {
        userId: user.id,
        name: name.trim(),
        parentId: parentId || null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "该层级下已存在同名标签" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: color || null,
        parentId: parentId || null,
        sortOrder: sortOrder || 0,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, data: tag });
  } catch (error: any) {
    console.error("创建标签失败:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 编辑标签
export async function PUT(request: Request) {
  try {
    const user = await getDefaultUser();
    const body = await request.json();
    const { id, name, color, sortOrder, parentId } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "标签ID不能为空" },
        { status: 400 }
      );
    }

    // 查找标签
    const tag = await prisma.tag.findFirst({
      where: { id, userId: user.id },
    });

    if (!tag) {
      return NextResponse.json(
        { success: false, error: "标签不存在" },
        { status: 404 }
      );
    }

    // 如果修改了名称，检查同级下是否已有同名
    if (name && name.trim() !== tag.name) {
      const existing = await prisma.tag.findFirst({
        where: {
          userId: user.id,
          name: name.trim(),
          parentId: parentId !== undefined ? parentId || null : tag.parentId,
          NOT: { id },
        },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "该层级下已存在同名标签" },
          { status: 400 }
        );
      }
    }

    // 防止将标签设为自己的子标签（循环引用）
    if (parentId && parentId === id) {
      return NextResponse.json(
        { success: false, error: "不能将标签设为自己的子标签" },
        { status: 400 }
      );
    }

    const updated = await prisma.tag.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(color !== undefined && { color: color || null }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(parentId !== undefined && { parentId: parentId || null }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("编辑标签失败:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 删除标签
export async function DELETE(request: Request) {
  try {
    const user = await getDefaultUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "标签ID不能为空" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.findFirst({
      where: { id, userId: user.id },
      include: { children: true },
    });

    if (!tag) {
      return NextResponse.json(
        { success: false, error: "标签不存在" },
        { status: 404 }
      );
    }

    // 删除关联的 DocumentTag 和 NoteTag
    await prisma.documentTag.deleteMany({ where: { tagId: id } });
    await prisma.noteTag.deleteMany({ where: { tagId: id } });

    // 子标签的 parentId 设为 null（变为顶层标签）
    if (tag.children.length > 0) {
      await prisma.tag.updateMany({
        where: { parentId: id },
        data: { parentId: null },
      });
    }

    await prisma.tag.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "标签已删除" });
  } catch (error: any) {
    console.error("删除标签失败:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
