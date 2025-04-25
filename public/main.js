import Game from './js/Game.js';

// 当文档加载完成时初始化游戏
window.addEventListener('DOMContentLoaded', () => {
  console.log('初始化...');

  const canvas = document.getElementById('renderCanvas');
  if (!canvas) {
    console.error('找不到画布元素!');
    return;
  }

  // 如果渲染系统和资源都加载完成，开始GAMEMODE_LOADING状态

  // 添加调试UI
  createDebugUI();
  // 启动游戏
  Game.initialize(canvas);
});

/**
 * 创建调试UI
 */
function createDebugUI() {
  const debugContainer = document.createElement('div');
  debugContainer.style.position = 'absolute';
  debugContainer.style.top = '10px';
  debugContainer.style.right = '10px';
  debugContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  debugContainer.style.color = 'white';
  debugContainer.style.padding = '10px';
  debugContainer.style.borderRadius = '5px';
  debugContainer.style.fontFamily = 'monospace';
  debugContainer.style.fontSize = '12px';
  debugContainer.style.zIndex = '1000';

  // 添加状态显示
  const stateInfo = document.createElement('div');
  stateInfo.id = 'debug-state';
  stateInfo.textContent = '状态: ' + StateManager.getCurrentState();
  debugContainer.appendChild(stateInfo);

  // 添加FPS显示
  const fpsInfo = document.createElement('div');
  fpsInfo.id = 'debug-fps';
  fpsInfo.textContent = 'FPS: 0';
  debugContainer.appendChild(fpsInfo);

  // 添加游戏对象计数
  const objectsInfo = document.createElement('div');
  objectsInfo.id = 'debug-objects';
  objectsInfo.textContent = '游戏对象: 0';
  debugContainer.appendChild(objectsInfo);

  // 添加到文档
  document.body.appendChild(debugContainer);

  // 更新调试信息
  let lastTime = performance.now();
  let frames = 0;
  
  function updateDebugInfo() {
    const currentTime = performance.now();
    frames++;
    
    // 每秒更新一次FPS
    if (currentTime - lastTime >= 1000) {
      const fps = Math.round(frames * 1000 / (currentTime - lastTime));
      fpsInfo.textContent = `FPS: ${fps}`;
      frames = 0;
      lastTime = currentTime;
      
      // 更新其他调试信息
      stateInfo.textContent = '状态: ' + Game.getCurrentState();
      objectsInfo.textContent = '游戏对象: ' + Game.gameObjects.length;
    }
    
    requestAnimationFrame(updateDebugInfo);
  }
  
  updateDebugInfo();
}

window.Game = Game;
window.RenderManager = RenderManager;