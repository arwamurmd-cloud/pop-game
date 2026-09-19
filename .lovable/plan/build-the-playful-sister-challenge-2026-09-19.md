# Build the playful sister challenge

## Experience
- Replace the blank home page with a desktop-only, three-act interactive experience.
- Open on the “Do you love me?” card, with a YES button and a NO button that smoothly evades the cursor while staying within the visible desktop area.
- Celebrate YES with confetti, tiny hearts, a soft glow, and an “I knew it.” message before continuing automatically.
- Reveal the challenge copy in timed beats, then let START enter the game.
- Keep the game instruction, score, and QUIT control visible while five pastel balloons gently float around the play area.
- On every pop, animate particles, increase the score beyond 5, and replace the balloon with two new balloons so the game becomes increasingly absurd.
- End immediately when QUIT is clicked, fade the balloons, reveal the handwritten note line by line, and provide RESTART.

## Visual direction
- Use a warm cream canvas, paper-like surfaces, sage accents, muted dusty blue and peach, restrained dusty rose, subtle floral line details, and crisp dark typography.
- Balance Pinterest editorial polish with Notion-like clarity and a gentle storybook warmth; avoid childish decoration and saturated pink.
- Keep motion smooth and tactile, with soft shadows, compact rounded controls, and reduced-motion support.

## Technical details
- Implement the state machine and interactions in the home route using React and TypeScript.
- Use Motion for React for transitions, evasive movement, balloon floating, pops, particles, and staged text.
- Define all colors, shadows, fonts, and reusable motion-related styles as semantic design tokens in the global stylesheet.
- Add route-specific title, description, Open Graph, and Twitter metadata.
- Verify the full sequence in the running desktop preview, including NO evasion, YES transition, balloon multiplication, scoring, QUIT, and RESTART.
