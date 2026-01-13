import * as THREE from 'three';
import { Landmark, POSE_CONNECTIONS, Hip2DTrajectory } from './types';

export class PoseRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private landmarkGroup: THREE.Group;
  private landmarkSpheres: THREE.Mesh[] = [];
  private connectionLines: THREE.Line[] = [];
  private grid: THREE.GridHelper;
  
  // Camera controls
  private cameraRadius = 10;
  private cameraAzimuth = 0;
  private cameraPhi = Math.PI / 6;
  private isDragging = false;
  private lastX = 0;
  private lastY = 0;

  constructor(canvas: HTMLCanvasElement) {
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setClearColor(0x000000);
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    // Setup scene
    this.scene = new THREE.Scene();
    
    // Add grid
    this.grid = new THREE.GridHelper(10, 20, 0x888888, 0x444444);
    this.scene.add(this.grid);

    // // Add axis indicator spheres
    // const axisSpheres = [
    //   { pos: [5, 0, 0], color: 0xff0000 }, // +X (red)
    //   { pos: [0, 5, 0], color: 0x00ff00 }, // +Y (green)
    //   { pos: [0, 0, 5], color: 0x0000ff }, // +Z (blue)
    // ];
    
    // axisSpheres.forEach(({ pos, color }) => {
    //   const sphere = new THREE.Mesh(
    //     new THREE.SphereGeometry(0.1, 16, 16),
    //     new THREE.MeshBasicMaterial({ color })
    //   );
    //   sphere.position.set(pos[0], pos[1], pos[2]);
    //   this.scene.add(sphere);
    // });

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      60, 
      canvas.clientWidth / canvas.clientHeight, 
      0.1, 
      50
    );
    this.updateCameraPosition();

    // Setup landmark visualization
    this.landmarkGroup = new THREE.Group();
    this.scene.add(this.landmarkGroup);
    this.initializeLandmarkVisualization();

    // Setup controls
    this.setupControls(canvas);
  }

  private initializeLandmarkVisualization() {
    const landmarkMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 });
    
    // Create landmark spheres
    for (let i = 0; i < 33; ++i) {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.0025, 8, 8), 
        landmarkMaterial
      );
      sphere.visible = false;
      this.landmarkGroup.add(sphere);
      this.landmarkSpheres.push(sphere);
    }

    // Create connection lines
    POSE_CONNECTIONS.forEach(() => {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(), 
        new THREE.Vector3()
      ]);
      const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
      const line = new THREE.Line(geometry, material);
      line.visible = false;
      this.landmarkGroup.add(line);
      this.connectionLines.push(line);
    });
  }

  private setupControls(canvas: HTMLCanvasElement) {
    // Mouse controls
    canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      
      const deltaX = e.clientX - this.lastX;
      const deltaY = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      
      this.cameraAzimuth += deltaX * 0.01;
      this.cameraPhi -= deltaY * 0.01;
      this.updateCameraPosition();
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch controls for mobile devices
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastX = e.touches[0].clientX;
        this.lastY = e.touches[0].clientY;
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this.isDragging || e.touches.length !== 1) return;
      
      const deltaX = e.touches[0].clientX - this.lastX;
      const deltaY = e.touches[0].clientY - this.lastY;
      this.lastX = e.touches[0].clientX;
      this.lastY = e.touches[0].clientY;
      
      this.cameraAzimuth += deltaX * 0.01;
      this.cameraPhi -= deltaY * 0.01;
      this.updateCameraPosition();
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.isDragging = false;
    }, { passive: false });

    // Pinch-to-zoom for mobile devices
    let lastPinchDistance = 0;
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        lastPinchDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentPinchDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        if (lastPinchDistance > 0) {
          const pinchDelta = currentPinchDistance - lastPinchDistance;
          if (pinchDelta < 0) {
            this.cameraRadius = Math.min(20, this.cameraRadius + Math.abs(pinchDelta) * 0.01);
          } else {
            this.cameraRadius = Math.max(2, this.cameraRadius - pinchDelta * 0.01);
          }
          this.updateCameraPosition();
        }
        
        lastPinchDistance = currentPinchDistance;
      }
    }, { passive: false });

    // Scroll to zoom (for desktop)
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        this.cameraRadius = Math.max(2, this.cameraRadius - 0.3);
      } else {
        this.cameraRadius = Math.min(20, this.cameraRadius + 0.3);
      }
      this.updateCameraPosition();
    }, { passive: false });
  }

  private updateCameraPosition() {
    // Clamp phi to avoid flipping
    this.cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraPhi));
    
    this.camera.position.x = this.cameraRadius * Math.sin(this.cameraPhi) * Math.sin(this.cameraAzimuth);
    this.camera.position.y = this.cameraRadius * Math.cos(this.cameraPhi);
    this.camera.position.z = this.cameraRadius * Math.sin(this.cameraPhi) * Math.cos(this.cameraAzimuth);
    this.camera.lookAt(0, 0, 0);
  }

  public updateLandmarks(
    landmarks: Landmark[], 
    hipOffset: { x: number; y: number } = { x: 0, y: 0 }
  ) {
    if (!landmarks) {
      this.landmarkSpheres.forEach(s => s.visible = false);
      this.connectionLines.forEach(l => l.visible = false);
      return;
    }

    // Update landmark positions
    for (let i = 0; i < this.landmarkSpheres.length; ++i) {
      if (landmarks[i]) {
        // Flip X to correct horizontal mirroring, flip Y for Three.js
        const x = -landmarks[i].x + hipOffset.x;
        const y = -landmarks[i].y + hipOffset.y;
        const z = landmarks[i].z;
        
        this.landmarkSpheres[i].position.set(x, y, z);
        this.landmarkSpheres[i].visible = true;
      } else {
        this.landmarkSpheres[i].visible = false;
      }
    }

    // Update connection lines
    for (let c = 0; c < POSE_CONNECTIONS.length; ++c) {
      const [i, j] = POSE_CONNECTIONS[c];
      if (landmarks[i] && landmarks[j]) {
        const a = this.landmarkSpheres[i].position;
        const b = this.landmarkSpheres[j].position;
        
        const positions = new Float32Array([
          a.x, a.y, a.z,
          b.x, b.y, b.z
        ]);
        
        this.connectionLines[c].geometry.setAttribute(
          'position', 
          new THREE.BufferAttribute(positions, 3)
        );
        this.connectionLines[c].geometry.attributes.position.needsUpdate = true;
        this.connectionLines[c].visible = true;
      } else {
        this.connectionLines[c].visible = false;
      }
    }
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  public dispose() {
    // Clean up Three.js resources
    this.landmarkSpheres.forEach(sphere => {
      sphere.geometry.dispose();
      if (sphere.material instanceof THREE.Material) {
        sphere.material.dispose();
      }
    });
    
    this.connectionLines.forEach(line => {
      line.geometry.dispose();
      if (line.material instanceof THREE.Material) {
        line.material.dispose();
      }
    });
    
    this.renderer.dispose();
  }
}
