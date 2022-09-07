

# js13k 2022


## to do dev
run 
`npx vite dev --host`

to package
`node build.js`

sound generator here:
https://killedbyapixel.github.io/ZzFX/



## DEATH ON A JET PACK
in a garden...

#### death GROWS A GARDEN on a jetpack....

- MUST: need an instruction/setup screen
    - shows until user hits space bar
    - STARTED

- MUST: need graphics for rockets?
    - if not i need particles at least i think?
    
- MUST: need an end of game screen
    - this could just be a dialog?
    - once garden is visible
    - game ends
    - bad guys can continue to move in the bg?
    - goes back to instruction setup screen

- MUST: garden implementation
    - MAYBE THE GARDEN IS GOOD
    - and the evil things are taking away from it
    - instead of adding to it? i dunno
    - V1
        - garden is revealed at the bottom of the screen
        - like a progress bar that shrinks and grows
        - there is a percentage shown so user knows what is up
    - v2
        - garden is always present and is revealed based
        - on opacity?
        - as the score gets closer to 255 it shows
        - once it hits 255 game over

    - score
        - rocket goes in goal (helps bad)
        - rocket blocked ?
        - rocket hits bad (helps good)

- Q: should I show the score
    - see garden implementation for ideas here
    - showing the garden here seems like a much better thing
    - maybe a percentage towards the fail?

- need have a 2nd bad guy that shoots differently
    - aka uses the angle to determine the shot
    - this bad will be colored slightly differently

- NICETOHAVE: need a 3rd bad guy that shoots in a curved way?
    - this bad will be colored differently

- BUG: fix the floor draw bug

- BUG/FEATURE: a bug if a player comes down over a rocket
    - the rocket can stick and stop moving

- BUG:
    - bad not coming on to screen all the way?


- DONE: BUG: need bads to come out slower
- DONE: MUST: need bad guys to explode if hit
- DONE: MUST: need sound still even just tiny bits
    - need a theme playing during other screens?
    - need effects for hits that go into the goal
    - need sound for rocket being shot
    - need sound for rocket being blocked
    - need sound for bad being hit
- DONE: need a title screen
    - shows for a few seconds and moves on
    - no controls
- DONE: MUST: need scrolling backgrounds
    - MAKE THESE IN CODE
    - not enough room
- DONE: MUST: bring bad guys further onto screen
- DONE: MUST: slow down rockets a bit?
