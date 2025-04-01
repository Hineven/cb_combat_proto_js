window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('renderCanvas'); // 获取画布
  const engine = new BABYLON.Engine(canvas, true); // 创建引擎

  const createScene = () => {
    const scene = new BABYLON.Scene(engine);

    // 创建相机
    const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    // 创建光源
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // 创建一个简单的地面
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);

    return scene;
  };

  const scene = createScene();

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener('resize', () => {
    engine.resize();
  });
});
