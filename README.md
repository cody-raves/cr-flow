
# CR Flow – Skill-Based Flow Puzzle Minigame (5x5–9x9, Guaranteed Solvable)
https://streamable.com/mtgvjq for a video example 

The core idea:

>  Every puzzle is **randomly generated AND guaranteed solvable**  
>  Success is **100% skill-based** – no fake RNG fail after a perfect run

If the player solves the board in time, they succeed.  
If they don’t, they fail. There’s no hidden dice roll inside the minigame.

---

##  What it is

- Flow-style puzzle: connect matching colored dots without crossing paths
- Boards are generated from a **Hamiltonian path** so they’re *always* solvable
- Supports **5x5, 6x6, 7x7, 8x8, 9x9** grids
- Time limit per puzzle (seconds) to scale difficulty
- Perfect to plug into:
  - Lockpicking
  - Safes / vaults / laptops
  - Heists / job hacks
  - Any “skill check” you want that isn’t just spam-E or QTE

---

##  Key Features

-  **Random but solvable**  
  Every board is generated fresh and guaranteed to have a solution.

-  **Pure skill, no RNG outcome**  
  The export returns `true/false` based only on whether the player actually solved it in time.

-  **Scalable difficulty**
  - `gridSize` from **5–9** (5x5 → 9x9)
  - `timeLimit` in seconds
  - Make better tools easier (reward) or harder (challenge) – your call.

-  **Clean NUI**
  - Canvas-based board
  - Animated timer border that fills as time runs out

-  **Sound hooks**
  - Pair connect
  - Fail / overwrite
  - Puzzle complete
