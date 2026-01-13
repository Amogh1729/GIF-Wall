# GIF Wall

A dynamic, masonry-style gallery for viewing animated GIFs.

![Project Preview](https://via.placeholder.com/800x400?text=GIF+Wall+Preview)

## Features
- **Dynamic Loading**: Automatically loads GIFs from the `Resource` folder.
- **Masonry Layout**: Pinterest-style responsive grid that preserves aspect ratios.
- **Toggle Layout**: Switch between "Original Size" (Masonry) and "Fixed Size" (Grid).
- **Lightbox**: Click any GIF to view it in full screen.
- **Dual Mode**:
  - **Local**: Runs with a Node.js server (`node server.js`).
  - **Online**: Deployed via GitHub Actions with a static JSON generator.

## Live Demo
[https://Amogh1729.github.io/GIF-Wall/](https://Amogh1729.github.io/GIF-Wall/)

## How to add GIFs
1.  Clone the repository.
2.  Add `.gif` files to the `Resource` folder.
3.  Push to GitHub.
    - The GitHub Action will automatically regenerate the list and update the site.

## Running Locally
1.  Install Node.js.
2.  Run `node server.js`.
3.  Open `http://localhost:3000`.
