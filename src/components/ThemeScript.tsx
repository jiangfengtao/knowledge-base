// 内联脚本，在页面渲染前设置主题，避免闪烁
export default function ThemeScript() {
  const code = `
    (function() {
      try {
        var saved = localStorage.getItem('theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var dark = saved === 'dark' || (!saved && prefersDark);
        if (dark) {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
