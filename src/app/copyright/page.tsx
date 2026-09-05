import Link from "next/link";
import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";
import MobileBottomNav from "@/components/MobileBottomNav";
import {
  Shield,
  FileWarning,
  Mail,
  Copy,
  Share2,
  Ban,
  KeyRound,
  Flag,
  AlertTriangle,
  Phone,
  CheckCircle,
  XCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "版权声明 - 晓桃终生成长",
  description: "晓桃终生成长网站的版权声明和使用条款。",
  alternates: { canonical: "https://xiaotaotop.com/copyright" },
};

export default function CopyrightPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rule">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
              桃
            </div>
            <span className="font-semibold text-ink">晓桃终生成长</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-rule rounded-2xl p-8 sm:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center">
              <Shield size={24} className="text-accent-deep" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ink">版权声明</h1>
              <p className="text-sm text-muted">最后更新：2026年9月</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* 一、版权所有 */}
            <section>
              <h2 className="text-lg font-semibold text-ink mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-accent rounded-full" />
                一、版权所有
              </h2>
              <div className="ml-3 space-y-3 text-muted leading-relaxed">
                <p>
                  本网站（xiaotaotop.com）所有原创内容，包括但不限于文章、图片、音频、视频、代码等，均由晓桃创作并享有完整著作权。
                </p>
                <p>
                  除特别注明外，所有内容均采用
                  <strong className="text-ink">保留所有权利</strong>
                  的方式授权。
                </p>
                <div className="mt-4 p-4 bg-bg rounded-xl">
                  <p className="text-sm text-ink font-medium mb-2">
                    不同文章可能采用不同的版权协议，以文章底部标注为准：
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-deep mt-0.5">•</span>
                      <span>
                        <strong className="text-ink">保留所有权利</strong>
                        ：默认协议。未经授权，禁止任何形式的转载和复制。
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-deep mt-0.5">•</span>
                      <span>
                        <strong className="text-ink">CC BY 4.0（署名）</strong>
                        ：可以自由分享、修改，甚至商用，但必须注明原作者和出处链接。
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-deep mt-0.5">•</span>
                      <span>
                        <strong className="text-ink">CC BY-NC 4.0（署名-非商用）</strong>
                        ：可以自由分享、修改，但不得用于商业用途，且必须注明出处。
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-deep mt-0.5">•</span>
                      <span>
                        <strong className="text-ink">CC BY-NC-SA 4.0（署名-非商用-相同方式共享）</strong>
                        ：可以自由分享、修改，但不得商用，修改后的作品须以相同协议发布。
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 二、您可以做的 */}
            <section>
              <h2 className="text-lg font-semibold text-ink mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-green-500 rounded-full" />
                二、您可以做的
              </h2>
              <ul className="ml-3 space-y-2 text-muted leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>阅读和浏览本网站的公开内容</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>将文章链接分享给朋友（转发链接，而非全文复制）</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>在社交媒体上引用少量内容并注明出处和链接</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>订阅 RSS 和邮件更新</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>将文章收藏到浏览器书签</span>
                </li>
              </ul>
            </section>

            {/* 三、禁止做的 */}
            <section>
              <h2 className="text-lg font-semibold text-ink mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-red-500 rounded-full" />
                三、禁止做的
              </h2>
              <div className="ml-3 space-y-3">
                <p className="text-muted text-sm mb-2">
                  未经授权，严禁以下行为：
                </p>
                <ul className="space-y-2 text-muted leading-relaxed">
                  <li className="flex items-start gap-2">
                    <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-ink">抄袭</strong>
                      ：将整篇文章或大段内容复制后，以自己的名义发布到任何平台
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-ink">洗稿</strong>
                      ：对原文进行改写、调换语序、更换同义词后重新发布
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-ink">商用</strong>
                      ：将本网站内容用于商业用途，包括付费课程、付费社群、电子书、付费公众号等
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-ink">转载不注明</strong>
                      ：转载时不注明原作者、出处链接，或使用"来源网络"等模糊表述
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-ink">修改改编</strong>
                      ：修改、改编、翻译本网站内容后再发布
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-ink">会员内容泄露</strong>
                      ：将会员专属内容分享、截图、录屏传播给非会员
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-ink">去除版权标识</strong>
                      ：去除或修改版权声明、作者署名、水印等标识
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-ink">AI 训练</strong>
                      ：将本网站内容用于 AI 模型训练、生成式 AI 数据集等
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 四、如何申请授权 */}
            <section>
              <h2 className="text-lg font-semibold text-ink mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-500 rounded-full" />
                四、如何申请授权
              </h2>
              <div className="ml-3 space-y-3 text-muted leading-relaxed">
                <p>
                  如果你希望转载、引用或使用本网站的内容，且超出了"合理使用"范围，请按以下流程申请授权：
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-bg rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <p className="text-ink font-medium text-sm">发送邮件申请</p>
                      <p className="text-sm mt-1">
                        发送邮件至 <span className="text-ink font-mono">contact@xiaotaotop.com</span>，邮件标题格式为「授权申请 + 使用场景」。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-bg rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <p className="text-ink font-medium text-sm">提供使用详情</p>
                      <p className="text-sm mt-1">
                        请在邮件中说明：使用的文章标题/链接、使用平台、使用方式（转载/引用/改编等）、是否商用、预计发布时间。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-bg rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <p className="text-ink font-medium text-sm">等待回复</p>
                      <p className="text-sm mt-1">
                        我会在 48 小时内回复，告知是否授权以及授权条件。未收到回复前，请勿擅自使用。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-bg rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                      4
                    </div>
                    <div>
                      <p className="text-ink font-medium text-sm">按约定使用</p>
                      <p className="text-sm mt-1">
                        获得授权后，请严格按照约定的方式使用，并按要求注明作者和出处链接。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">
                    <strong>提示：</strong>
                    对于非商业用途的公众号转载，通常会免费授权，但要求必须注明作者、原文链接，且不得修改内容。
                  </p>
                </div>
              </div>
            </section>

            {/* 五、侵权举报方式 */}
            <section>
              <h2 className="text-lg font-semibold text-ink mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-orange-500 rounded-full" />
                五、侵权举报方式
              </h2>
              <div className="ml-3 space-y-3 text-muted leading-relaxed">
                <p>
                  如果你发现有以下情况，请通过下方方式向我举报：
                </p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <Flag size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>有人抄袭、洗稿本网站内容</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Flag size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>有人未经授权将本网站内容用于商业用途</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Flag size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>有人违规传播会员专属内容</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Flag size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>本网站内容侵犯了你的合法权益</span>
                  </li>
                </ul>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-bg rounded-lg">
                    <Mail size={18} className="text-muted flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted">举报邮箱</p>
                      <p className="text-ink font-mono">contact@xiaotaotop.com</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm mt-3">
                  举报时请尽量提供以下信息，以便我更快核实处理：
                </p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-deep">•</span>
                    <span>原文链接（本网站的文章地址）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-deep">•</span>
                    <span>侵权内容的链接或截图</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-deep">•</span>
                    <span>侵权平台和账号名称</span>
                  </li>
                </ul>
                <p className="text-sm">
                  我会在收到举报后的 <strong className="text-ink">48 小时内</strong>
                  核实并处理。对于确认侵权的内容，将要求对方删除，必要时采取进一步法律措施。
                </p>
              </div>
            </section>

            {/* 六、免责声明 */}
            <section>
              <h2 className="text-lg font-semibold text-ink mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-gray-400 rounded-full" />
                六、免责声明
              </h2>
              <div className="ml-3 space-y-3 text-muted leading-relaxed">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong className="text-ink">内容仅供参考：</strong>
                    本网站内容仅供学习和交流使用，不构成任何投资、法律、医疗、财务等专业建议。
                    读者因参考本网站内容而做出的任何决定和行为，由读者自行承担责任。
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong className="text-ink">第三方链接：</strong>
                    本网站可能包含第三方链接，这些链接的内容不受本网站控制，本网站不对其内容的准确性、合法性负责。
                    用户访问第三方链接所产生的风险由用户自行承担。
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong className="text-ink">内容更新：</strong>
                    本网站内容可能随时更新，恕不另行通知。文章中的观点和信息仅代表发布时的观点，可能随时间变化而不再准确。
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong className="text-ink">评论内容：</strong>
                    用户在评论区发表的言论仅代表其个人观点，不代表本网站立场。
                    本网站有权删除违反法律法规和公序良俗的评论，但不对用户评论内容承担责任。
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong className="text-ink">服务中断：</strong>
                    因系统维护、升级或不可抗力等原因导致服务中断，本网站不承担责任。
                  </p>
                </div>
              </div>
            </section>

            {/* 七、联系方式 */}
            <section>
              <h2 className="text-lg font-semibold text-ink mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-purple-500 rounded-full" />
                七、联系方式
              </h2>
              <div className="ml-3 space-y-3 text-muted leading-relaxed">
                <p className="text-sm">
                  如有版权相关问题、合作洽谈或其他事宜，欢迎通过以下方式联系我：
                </p>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 bg-bg rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Mail size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted">邮箱</p>
                      <p className="text-ink font-mono">contact@xiaotaotop.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-bg rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Share2 size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted">网站</p>
                      <p className="text-ink font-mono">xiaotaotop.com</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm">
                  工作时间一般会在 24-48 小时内回复。感谢你的理解和支持！
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-rule bg-white pb-16 md:pb-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} 晓桃终生成长 · 用知识点亮成长之路</p>
        </div>
      </footer>

      {/* 移动端底部导航 */}
      <MobileBottomNav />
    </div>
  );
}
