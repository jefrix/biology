# Cellular Biology

An interactive atlas of human cell biology with eight modules. Open a module from the home screen, use Previous and Next to follow its chapters, or share the chapter URL. The ATP ledger includes a prediction exercise linked to the red-cell lesson.

## Run locally

From the repository root, run `python -m http.server 8000` and open http://localhost:8000/. The viewer loads Three.js and OrbitControls from a CDN. The lessons also run in text mode if the viewer cannot start.

## Add a chapter

1. In the relevant file under `modules/`, add a chapter alongside its siblings with a unique ID, short name, location, title, legend, and HTML function. Keep reading material and activities usable without the 3D scene.
2. In that module's build function, follow an adjacent chapter's setup for the scene, camera pose, and animation behavior.
3. Add the chapter ID in the same position in the module's MANIFEST entry in `shared/core.js`. Update its home-card outline as needed. Shared layout and styles live in `index.html` and `shared/core.css`.
4. Run `node check-chapters.cjs`. Open the new chapter directly by its hash and check the transitions on both sides of it.
