import { createGeminiSession, disconnect } from './index.js';

const { ops } = await createGeminiSession();

// 查找对话操作菜单按钮并点击
const menuBtn = await ops.operator.query(() => {
  const btns = document.querySelectorAll('button[aria-label="打开对话操作菜单。"]');
  if (btns.length > 0) {
    // 点击第一个
    btns[0].click();
    return { found: true, count: btns.length };
  }
  return { found: false };
});

console.log('Menu button:', JSON.stringify(menuBtn));

// 等待菜单出现
await new Promise(r => setTimeout(r, 500));

// 探测菜单项
const menuItems = await ops.operator.query(() => {
  // 查找弹出的菜单
  const menus = document.querySelectorAll('[role="menu"], [role="menuitem"], [role="menuitemradio"]');
  const items = [];
  
  for (const menu of menus) {
    const visible = menu.offsetWidth > 0 && menu.offsetHeight > 0;
    if (visible) {
      const buttons = Array.from(menu.querySelectorAll('button, [role="menuitem"]'));
      for (const btn of buttons) {
        items.push({
          text: btn.textContent?.trim().substring(0, 30),
          ariaLabel: btn.getAttribute('aria-label')
        });
      }
    }
  }
  
  return { visibleMenus: menus.length, items };
});

console.log('Menu items:', JSON.stringify(menuItems, null, 2));

disconnect();
