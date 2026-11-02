# Stacklight

An original, real-time falling-block game inspired by Tetris. Stack seven shapes, complete horizontal lines, and keep the board clear as the pace increases. This independent kata is not affiliated with or endorsed by the Tetris Company.

## Play

[Play Stacklight online](https://intrepion.github.io/kata-inspired-by-tetris-codex-dot/).

Open `index.html` in a modern browser, or run `python3 -m http.server` and visit `http://localhost:8000`. No dependencies or build step are needed.

Move with left/right arrows, rotate with up or X (Z rotates back), soft drop with down, hard drop with Space, hold with C, and pause with P. Touch controls appear on smaller screens. The game pauses when the tab is hidden. Scores for line clears increase with level; the level rises every ten lines. Your best score is stored locally in your browser.

## Test

Run `node tests/game.test.js`.

## License

MIT; see [LICENSE](LICENSE). The root `.gitignore` combines GitHub's global Linux, macOS, and Windows templates.

## Arcade metadata

See [docs/arcade-metadata.md](docs/arcade-metadata.md) for the game-owned manifest and screenshot provenance.
