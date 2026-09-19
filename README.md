# Never Gonna Let You Go

Build a desktop-only interactive website that feels elegant, modern, playful, and slightly mischievous.

 Design Style

Think:

Pinterest aesthetic 

Clean modern UI

Soft cream backgrounds

Warm beige

Sage green accents

Dusty rose accents (very limited)

Minimal floral details

Cute but mature

Cozy and premium

Similar to Notion + Pinterest + Studio Ghibli vibes

Avoid:

Hot pink

Excessive bows

Kawaii overload

Childish cartoon style

Overcrowded decorations

The website should feel like something a college student would actually make for her sister.

SCREEN 1

Love Question

Center a clean card on the screen.

Text:

"Do you love me?"

Buttons:

YES

NO

Style:

Rounded buttons

Soft shadows

Elegant typography

Smooth animations

No Button Behavior

The NO button should NEVER be clickable.

Whenever the cursor gets close to the NO button:

The button smoothly glides to a new position.

Use easing animations.

No sudden jumps.

It should feel playful and intelligent.

Movement must stay inside the desktop boundaries.

The user should keep trying but never succeed.

Eventually they click YES.

YES ANIMATION

When YES is clicked:

Small confetti burst

Tiny floating hearts

Soft glow animation

Then show a popup message:

"I knew it."

The popup should feel playful and confident.

Pause briefly.

Then transition smoothly to the next screen.

SCREEN 2

Challenge Screen

Centered text:

"Great."

Pause.

Then:

"Now win this game to get rid of me."

Show a clean button:

START

When START is clicked:

Transition into the game.

SCREEN 3

Balloon Game

This is the main joke.

At the top of the screen display:

"Pop 5 balloons to get rid of me."

This text must remain visible the entire time.

Initial State

Spawn exactly:

5 balloons

Scattered randomly around the screen.

Balloon style:

Soft pastel colors

Beige

Sage

Dusty blue

Cream

Muted peach

Not bright colors.

Each balloon should gently float.

Balloon Logic

When a balloon is clicked:

Play a satisfying pop animation.

Create a tiny particle burst.

Increase the score.

But immediately:

That balloon splits into TWO NEW BALLOONS.

Example:

5 balloons

Click one

↓

4 balloons remain

↓

2 new balloons appear

↓

6 balloons total

The number of balloons slowly grows.

The player initially believes they are making progress.

Then realizes the balloons keep multiplying.

The game should become increasingly ridiculous.

Score Counter

Display:

0 / 5

1 / 5

2 / 5

3 / 5

etc.

But keep counting beyond 5.

Examples:

8 / 5

14 / 5

27 / 5

42 / 5

This subtly reveals that something is wrong.

Quit Button

Always show a small button:

QUIT

in the top-right corner.

The user can click it anytime.

No confirmation modal.

Immediately trigger the ending.

FINAL SCREEN

The balloons fade away.

Screen becomes clean again.

Center a handwritten-style note.

Text appears line by line.

First:

"Hahaha..."

Pause.

Then:

"Seems like you can never get rid of me."

Pause.

Below:

RESTART

button.

Technical Requirements

React + TypeScript

Framer Motion animations

Desktop only

Smooth transitions

Modern typography

High quality micro-interactions

Subtle sound effects (optional)

Premium feel

Clean code

Most important:

The experience should feel clever, charming, and funny — not childish. The joke should land naturally when the player realizes the balloons are multiplying forever.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/36760134-baf2-4a7e-9aa1-943cc024dcbf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
