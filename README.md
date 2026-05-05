# Aayushman Srivastava Mechanical Engineering Portfolio

This is a static portfolio site for mechanical engineering projects with interactive `.glb` model previews. It is designed to be hosted on GitHub Pages without a build step.

## What's Included

- `index.html` - page structure
- `styles.css` - responsive visual design and themes
- `script.js` - interactive 3D viewers and page behavior
- `projects.js` - portfolio data, model descriptions, links, and contact info
- `assets/models` - GLB files used by the model viewers
- `assets/Resume.pdf` - linked resume file
- `serve.ps1` - small local preview server for Windows

## Edit Content

- Update your name, links, project descriptions, and contact info in `projects.js`.
- Put GLB files in `assets/models`.
- The visible model title is generated from each model's `fileName` value, with `.glb` removed for display.
- In `projects.js`, make each model `src` match the exact file name, for example:

```js
fileName: "My Assembly.glb",
src: "assets/models/My Assembly.glb"
```

## Preview Locally

Run the included local server from this folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 5500
```

Then open:

```text
http://localhost:5500
```

## Best CAD Export Workflow

Keep STEP, SLDPRT, or Fusion files as your editable source models. For the website, export clean `.glb` files from the CAD tool or a converter that preserves normals, part separation, and materials. STEP is excellent for engineering exchange, but browsers do not display STEP files directly without a heavy converter, so GLB is still the right final website format.

Good GLB exports should have:

- outward-facing normals
- separate bodies only when they are real parts
- simple part materials or colors
- reduced triangle count for web loading
- visible edges or bevels where the geometry needs definition

## Publish With GitHub Pages

Upload this folder to a GitHub repository, then enable GitHub Pages:

1. Create a new GitHub repository.
2. Upload all project files and folders, including `assets`.
3. Open the repository settings.
4. Go to `Pages`.
5. Set the source to the main branch and root folder.
6. Save, then wait for GitHub to publish the site.

The site uses only HTML, CSS, JavaScript, and files in `assets`, so it does not need a build step.
