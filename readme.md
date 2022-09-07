

# js13k 2022

## DEATH ON A JET PACK
in a garden...

#### death GROWS A GARDEN on a jetpack....

- DONE: need a title screen
    - shows for a few seconds and moves on
    - no controls

- need an instruction/setup screen
    - shows until user hits space bar
    - STARTED
    
- need an end of game screen
    - once garden is visible
    - game ends
    - bad guys can continue to move in the bg?
    - goes back to instruction setup screen

- should I show the score
    - showing the garden here seems like a much better thing

- as the rockets come in
    - they begin to reveal a garden
        - as the score goes negative
        - this is what is driving it
    - if the garden is finished the game is over
    - blocking the rockets helps remove some of the garden
    - destroying a bad guy helps remove some of the gardne
    - it is rogue like in that you will lose
    - the garden will grow
    - you just have to stop it as long as you can

- need a garden that grows over time
    - as score increases more of the garden is shown
    - not sure how to implement this exactly
    - IDEA: draw the entire garden all at once
    - the score is really just effecting the opacity
    - so as the score gets closer to -255 you are seeing
    - more and more of the garden
    
- need have a 2nd bad guy that shoots differently
    - aka uses the angle to determine the shot
    - this bad will be colored slightly differently

- need a 3rd bad guy that shoots in a curved way?
    - this bad will be colored differently

- need scrolling backgrounds

- need bads to come out slower

- need bad guys to explode if hit

- need sound still even just tiny bits
    - need a theme playing during other screens?
    - need effects for hits that go into the goal
    - need sound for rocket being shot
    - need sound for rocket being blocked
    - need sound for bad being hit
    
- TODO: a bug if a player comes down over a rocket
    - the rocket can stick and stop moving
