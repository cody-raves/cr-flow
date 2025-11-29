<h1 align="center">cr-flow</h1>

<div align="center">
  <img height="197" src="https://i.ibb.co/XZBXZVBw/flow.gif" />
</div>

<p align="center">
  Skill-Based Puzzle Minigame with randomly generated puzzles.<br>
  Supports 5x5, 6x6, 7x7, 8x8, 9x9 sized grids.
</p>

<p align="center">
  Perfect to plug into:<br>
  • Lockpicking<br>
  • Safes / vaults / laptops<br>
  • Heists / job hacks<br>
  • Any “skill check” you want that isn’t just spam-E or QTE
</p>

---

<p align="center"><b>Exports</b></p>

```lua
-- 1) Set only the puzzle timer (in seconds)
--    Next time the UI opens, it will use this time limit.
exports['cr-flow']:SetFlowTimer(15)

-- 2) Set only the puzzle grid size
--    5–9 → 5x5 up to 9x9 (values outside this range are clamped).
exports['cr-flow']:SetFlowGridSize(7)

-- 3) Run a one-shot Flow puzzle and get a boolean result
--    First argument  = grid size  (5–9)
--    Second argument = time limit (seconds)
local success = exports['cr-flow']:PlayFlowPuzzle(7, 18)

if success then
    -- player solved the puzzle in time
else
    -- player failed, ran out of time, or closed it
end
