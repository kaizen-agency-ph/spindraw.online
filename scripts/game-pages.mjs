// The six playable game pages: the app runs at the top, this content sits below it.
// Each page targets the searches people actually make for that kind of picker (researched from
// Google autocomplete and competitor pages, 2026-11-22). Every claim here must match the app:
// recheck when a game changes, and bump `updated`.

export const GAME_GUIDES = [
  {
    slug: 'random-name-picker',
    play: 'wheel',
    nav: 'Random name picker wheel',
    short: 'Wheel',
    updated: '2026-11-22',
    title: 'Random Name Picker Wheel – Free, Multiple Winners | SpinDraw',
    description: 'Free random name picker wheel: paste a list, spin to pick a name, and draw multiple winners in a row. Weighted entries, comment import, no sign-up.',
    h1: 'Random name picker wheel',
    lede: 'Paste a list, spin the wheel, get a name. Use it to pick a student, a team order, a giveaway winner or a lucky-draw prize, with as many names as you need.',
    answer: 'A random name picker wheel is a spinning wheel with one slice per name. You paste your list, spin, and the pointer lands on a random winner. SpinDraw’s wheel is free, needs no sign-up, handles thousands of names, lets you give someone extra entries with “Name x3”, and can give you a link that proves the pick was fair.',
    glance: [
      ['Names', 'Thousands'],
      ['Winners', 'One per spin; keep spinning to draw more'],
      ['Spin length', '3 to 15 seconds (7 by default)'],
      ['Extra entries', 'Yes, write “Name x3”'],
      ['Import', 'Paste a list, copied comments or chat, a CSV file or a Google Sheet link'],
      ['Price', 'Free, no account'],
    ],
    stepsTitle: 'How to pick a random name from a list',
    steps: [
      'Paste your names in the <strong>Entries</strong> tab above, one per line. Duplicates are removed unless you turn that off.',
      'To give someone better odds, write <em>Name x2</em> or <em>Name x3</em>.',
      'Optional: click <strong>Lock entries</strong> in the Draw tab so everyone sees a code before the spin.',
      'Press <strong>Spin</strong> or the Space bar. The pointer lands on the winner.',
      'Keep spinning to draw more names. With <strong>Remove winners</strong> on, nobody is picked twice.',
    ],
    body: `
<h2>Picking multiple winners</h2>
<p>The wheel picks one name per spin, which keeps the suspense for every prize. List your prizes in the <strong>Prizes</strong> tab in the order you’ll draw them (for example 3rd, 2nd, then 1st), and each spin is matched to the next prize. Winners drop off the wheel, a claim timer gives them time to respond, and R redraws a no-show. If you’d rather reveal several winners in one go, the <a href="/slot-machine-name-picker/">slot machine</a> and the races pick up to 50 in a single run.</p>
<h2>Who uses a name picker wheel</h2>
<ul>
  <li><strong>Teachers:</strong> pick who answers next, or spin until the wheel is empty to set a presentation order. See the <a href="/classroom-name-picker/">classroom guide</a>.</li>
  <li><strong>Giveaways on Facebook, Instagram, TikTok and YouTube:</strong> paste the copied comments and count only those with a keyword like <em>#join</em>.</li>
  <li><strong>Office raffles and lucky draws:</strong> put the wheel on a big screen with your logo in the middle. See the <a href="/office-raffle/">office raffle guide</a>.</li>
  <li><strong>Teams and families:</strong> who goes first, who hosts next, who pays for dinner, or a <a href="/secret-santa-name-picker/">Secret Santa</a> order.</li>
</ul>
<h2>Is the wheel really random?</h2>
<p>Each pick comes from a cryptographic HMAC-SHA256 of a 256-bit random seed, never from <code>Math.random()</code>. Lock the list first and the wheel shows a code that commits to the list and the secret seed before anything spins. Afterwards, the verify link lets anyone re-run every pick and check it came from that locked list.</p>
<h2>Tips</h2>
<ul>
  <li>Long names are shortened on their slice, but the winner card always shows the full name.</li>
  <li>Use <strong>Present</strong> for a clean full-screen wheel on a projector or a shared screen in Zoom, Meet or Teams.</li>
  <li>The <strong>Results CSV</strong> button saves every winner, prize and time for your records.</li>
</ul>`,
    faq: [
      ['Is the random name picker wheel free?', 'Yes. It’s free and needs no account. If the site ever shows ads, they’ll never appear on the wheel or the stream overlay.'],
      ['How many names can the wheel hold?', 'Thousands. With very long lists the slices get thin, but every name still has its fair share of the chance.'],
      ['Can the wheel pick multiple winners?', 'Yes, one per spin. Keep Remove winners on so nobody wins twice, and list your prizes so each spin is matched to the next prize. To reveal up to 50 winners in one run, use the slot machine or a race.'],
      ['Can I give someone more entries?', 'Yes. Write “Name x3” to give that person three entries, so three times the chance of a single entry.'],
      ['Can I pick a name from Facebook or YouTube comments?', 'Yes. Copy the comments, choose “Copied comments” as the paste format, and optionally count only comments containing a keyword.'],
      ['Are my names uploaded anywhere?', 'No. Names are stored only in your browser. They’re shared only if you choose to share a verify link or proof file.'],
    ],
  },
  {
    slug: 'ball-race-name-picker',
    play: 'race',
    nav: 'Marble race name picker',
    short: 'Ball Race',
    updated: '2026-11-22',
    title: 'Marble Race Name Picker – Race Your Names Free | SpinDraw',
    description: 'Free marble race name picker: every name gets a ball and races to the finish. Pick one winner or a full finishing order, like a fantasy draft order.',
    h1: 'Marble race name picker: race your names to the finish',
    lede: 'Every name gets a marble. They drop through pegs, spinning bars and bumpers while a live board shows who’s winning, and the first across the line wins. Pick one winner, or a whole finishing order.',
    answer: 'A marble race name picker turns a list of names into a race: each name gets a marble, the marbles roll down an obstacle course, and the first to finish wins. SpinDraw’s marble race is free, takes up to 100 names, can rank up to 50 finishers in order, and uses a locked fair draw, so every entry has exactly its share of the chance.',
    glance: [
      ['Names', 'Up to 100'],
      ['Winners', 'Up to 50 per race, in finishing order'],
      ['Length', 'Quick (about 20 s), Normal (35 s) or Epic (60 s)'],
      ['Course', 'A different course every race'],
      ['Odds', 'Exactly each entry’s share, whatever the course'],
      ['Price', 'Free, no account'],
    ],
    stepsTitle: 'How to run a marble race with names',
    steps: [
      'Paste up to 100 names in the <strong>Entries</strong> tab above, one per line.',
      'Set <strong>How many winners?</strong>: 1 for a single winner, or more for a finishing order.',
      'Pick a length in the <strong>Style</strong> tab: Quick, Normal or Epic.',
      'Click <strong>Lock entries</strong> in the Draw tab so everyone sees the code before anything moves.',
      'Press <strong>Start race</strong> or Space. Click <strong>Present</strong> for a projector, a video call or a stream.',
    ],
    body: `
<h2>Use a marble race for your fantasy draft order</h2>
<p>A marble race is a popular way for fantasy football, basketball and baseball leagues to set the draft order, because everyone can watch their own marble. To get the whole order:</p>
<ol>
  <li>Paste every manager or team name, one per line.</li>
  <li>Set <strong>How many winners?</strong> to the number of teams, up to 50.</li>
  <li>Optional: in the <strong>Prizes</strong> tab, list <em>1st pick</em>, <em>2nd pick</em> and so on, so each finisher is labelled.</li>
  <li>Start the race. The first marble across gets the first pick, the second gets the next, and so on.</li>
  <li>Save the order with <strong>Results CSV</strong>, and share the verify link with the league.</li>
</ol>
<p>For a snake draft, use the finishing order for round one; your league app reverses it each round.</p>
<h2>What people see</h2>
<ul>
  <li>A name above every marble, so everyone can follow their own</li>
  <li>A camera that follows the leaders down a new course each time</li>
  <li>A live <strong>Who’s winning</strong> board with the top five</li>
  <li>Your slice colours from the Style tab on the marbles, plus seasonal themes</li>
</ul>
<h2>Is the marble race fair?</h2>
<p>In many marble races the physics decide, so a marble’s starting spot can change its odds. In SpinDraw, a fair draw from the locked list picks the winners first. The race runs real physics from a seed with nothing steering any marble, and the drawn names go on the marbles that finish first. Each person’s chance is exactly their share of the entries, and the verify link lets anyone re-run the draw afterwards.</p>
<h2>Good for</h2>
<p>Fantasy draft orders, giveaways and live streams, office parties, classrooms and game nights: anywhere watching the race is half the fun.</p>`,
    faq: [
      ['How many names can be in a marble race?', 'Up to 100. For bigger lists, use the wheel or the slot machine, which handle thousands.'],
      ['Can I get a full finishing order?', 'Yes. Set “How many winners?” to the number you need, up to 50, and the race runs until that many have finished, in order.'],
      ['Can I use it to set a fantasy football draft order?', 'Yes. Set the number of winners to your league size and the finishing order is your draft order. Results CSV saves it, and the verify link lets the league check it.'],
      ['Is the marble race rigged?', 'No one can steer it. The winners come from the locked draw, the same as the wheel, and the verify link shows the result came from the locked list.'],
      ['Do extra entries still count?', 'Yes. Everyone gets one marble, but “Name x3” still gives that person three times the chance, because the draw uses the entries.'],
      ['Can I show it in OBS or on a projector?', 'Yes. Add the overlay as a Browser source, or click Present for a clean view.'],
    ],
  },
  {
    slug: 'horse-race-name-picker',
    play: 'horse',
    nav: 'Horse race name picker',
    short: 'Horse Race',
    updated: '2026-11-22',
    title: 'Horse Race Name Picker & Draft Order Generator | SpinDraw',
    description: 'Free horse race name picker: every name gets a horse and jockey in a virtual race. Pick a winner or a full finishing order for your draft. Up to 100 names.',
    h1: 'Horse race name picker and virtual horse race',
    lede: 'Every name gets a pixel horse and jockey in their own racing colours. The field thunders down the track with the lead changing hands, and the first across the line wins. Pick one winner or a whole finishing order.',
    answer: 'A horse race name picker turns your list into a virtual horse race: each name gets a horse, they race to the finish, and the first across the line wins. SpinDraw’s horse race is free, takes up to 100 names, can rank up to 50 finishers in order for a draft order or prize list, and uses a locked fair draw so every entry has exactly its share of the chance.',
    glance: [
      ['Names', 'Up to 100'],
      ['Winners', 'Up to 50 per race, in finishing order'],
      ['Length', 'Quick (about 20 s), Normal (35 s) or Epic (60 s)'],
      ['Themes', 'Christmas turns the horses into reindeer, plus Halloween, New Year and more'],
      ['Betting', 'None. It’s a game for picking names'],
      ['Price', 'Free, no account'],
    ],
    stepsTitle: 'How to run a virtual horse race with names',
    steps: [
      'Paste up to 100 names in the <strong>Entries</strong> tab above, one per line.',
      'Set <strong>How many winners?</strong>: 1 for a single winner, or more for a finishing order.',
      'Pick a length in the <strong>Style</strong> tab: Quick, Normal or Epic.',
      'Click <strong>Lock entries</strong> in the Draw tab so everyone sees the code before the gates open.',
      'Press <strong>Start race</strong> or Space. Click <strong>Present</strong> for a projector, a video call or a stream.',
    ],
    body: `
<h2>Horse race draft order for fantasy leagues</h2>
<p>Commissioners use virtual horse races to set fantasy football draft order because the whole league can watch. To race for every pick:</p>
<ol>
  <li>Paste every manager or team name, one per line.</li>
  <li>Set <strong>How many winners?</strong> to the number of teams, up to 50.</li>
  <li>Optional: in the <strong>Prizes</strong> tab, list <em>1st pick</em>, <em>2nd pick</em> and so on.</li>
  <li>Lock the list, start the race and share your screen on the league call.</li>
  <li>Save the order with <strong>Results CSV</strong> and post the verify link in the group chat.</li>
</ol>
<p>For a snake draft, the finishing order is round one; your league app reverses it each round.</p>
<h2>What people see</h2>
<ul>
  <li>A horse and jockey for each person, with coat and silks based on their name</li>
  <li>A camera that runs with the leaders past the grandstand crowd, up to a checkered finish</li>
  <li>A live <strong>Who’s winning</strong> board, and “1st”, “2nd” and “3rd” tags as horses cross the line</li>
  <li>A name on every horse, so everyone can find themselves in the field</li>
</ul>
<h2>Office parties, fundraisers and race nights</h2>
<p>A horse race is a crowd-pleaser on a big screen: at office parties, end-of-year events, race-night themed fundraisers and family gatherings. List your prizes in draw order and the first horse home takes the first prize. If a winner doesn’t respond, press R; once everyone in that run is dealt with, a new race fills their place.</p>
<h2>Is the horse race fair?</h2>
<p>Yes. A fair draw from the locked list picks the winners first, and the race reveals them. Each horse runs on its own simulated pace, stamina and finishing kick with nothing steering it, and the drawn names go on the horses that finish first. Each person’s chance is exactly their share of the entries, and the verify link lets anyone re-run the draw.</p>`,
    faq: [
      ['How many horses can race?', 'Up to 100. For bigger lists, use the wheel or the slot machine, which handle thousands.'],
      ['Can I get a full finishing order?', 'Yes. Set “How many winners?” to the number you need, up to 50, and the race runs until that many have crossed the line, in order.'],
      ['Can I use it to pick my fantasy football draft order?', 'Yes. Set the number of winners to your league size, and the finishing order is the draft order. Results CSV saves it and the verify link proves it was fair.'],
      ['Is there any betting?', 'No. It’s a game for picking names, with no money or betting involved.'],
      ['Do extra entries still count?', 'Yes. Everyone gets one horse, but “Name x3” still gives that person three times the chance, because the draw uses the entries.'],
      ['Can I show it in OBS or on a projector?', 'Yes. Add the overlay as a Browser source, or click Present for a clean view.'],
    ],
  },
  {
    slug: 'battle-royale-name-picker',
    play: 'battle',
    nav: 'Battle royale name picker',
    short: 'Pixel Battle',
    updated: '2026-11-22',
    title: 'Battle Royale Name Picker – Name Battle Simulator | SpinDraw',
    description: 'Free battle royale name picker: up to 100 names become pixel fighters, and the last one standing wins. A fair name battle simulator for raffles and streams.',
    h1: 'Battle royale name picker: a name battle with pixel fighters',
    lede: 'Up to 100 names become little pixel fighters in one arena. They dodge, block and counter each other while the zone closes in, and the last ones standing are your winners.',
    answer: 'A battle royale name picker turns each name into a fighter in one arena, and the last fighter standing wins. SpinDraw’s pixel battle is free, takes up to 100 names, can pick up to 50 winners from the last ones standing, and uses a locked fair draw, so a fighter’s looks or stats never change anyone’s chances.',
    glance: [
      ['Names', 'Up to 100'],
      ['Winners', 'Up to 50: the last ones standing'],
      ['Length', 'Quick (about 20 s), Normal (35 s) or Epic (60 s)'],
      ['Extras', 'HP bars, a Most KOs board and a shrinking zone'],
      ['Odds', 'Equal shares for every entry; fighter stats don’t matter'],
      ['Price', 'Free, no account'],
    ],
    stepsTitle: 'How to run a name battle',
    steps: [
      'Paste up to 100 names in the <strong>Entries</strong> tab above, one per line.',
      'Set <strong>How many winners?</strong> if you want more than one.',
      'Pick a length in the <strong>Style</strong> tab: Quick, Normal or Epic.',
      'Click <strong>Lock entries</strong> in the Draw tab so everyone sees the code before the fight starts.',
      'Press <strong>Start battle</strong> or Space. Click <strong>Present</strong> for a projector, a video call or a stream.',
    ],
    body: `
<h2>How the fights play out</h2>
<ul>
  <li>Every person gets their own look, with a body, hat and weapon based on their name</li>
  <li>Fighters think for themselves: they pick targets, circle, dodge, block, counter and back off when hurt</li>
  <li>HP bars and damage numbers on every hit</li>
  <li>A counter of who’s still alive, plus a <strong>Most KOs</strong> board that shows the latest knockout for a moment</li>
  <li>A shrinking zone that keeps the action moving, and a zoom-in on the final two</li>
</ul>
<p>With several winners, the battle ends when that many fighters are left, and the one with the most KOs takes the first prize on your list.</p>
<h2>Is a name battle fair?</h2>
<p>In some name battle simulators, abilities or random stats decide who wins, so the odds aren’t equal. In SpinDraw, a fair draw from the locked list picks the winners first. The battle is a real simulated fight from a seed with nobody steered, and the drawn names go on the last fighters standing. Each person’s chance is exactly their share of the entries, and the verify link lets anyone re-run the draw.</p>
<h2>Good for</h2>
<p>Live streams and Discord communities, team events, classrooms and game nights. It’s a lighthearted cartoon fight between tiny pixel characters, with no blood or gore. For one-on-one matches instead of a free-for-all, try the <a href="/random-bracket-generator/">elimination bracket</a>.</p>`,
    faq: [
      ['How many fighters can there be?', 'Up to 100. For bigger lists, use the wheel or the slot machine, which handle thousands.'],
      ['Do stronger fighters have better odds?', 'No. How a fighter looks comes from their name, and the winner comes from the locked draw. Looks and stats make no difference to anyone’s chances.'],
      ['Can more than one fighter win?', 'Yes. Set “How many winners?” up to 50, and the battle ends when that many are left standing.'],
      ['Is it suitable for kids?', 'It’s a lighthearted cartoon fight between tiny pixel characters, with no blood or gore. Fighters are knocked out, and it’s all over in about a minute.'],
      ['Do extra entries still count?', 'Yes. Everyone gets one fighter, but “Name x3” still gives that person three times the chance, because the draw uses the entries.'],
      ['Can I show it in OBS or on a projector?', 'Yes. Add the overlay as a Browser source, or click Present for a clean view.'],
    ],
  },
  {
    slug: 'slot-machine-name-picker',
    play: 'slot',
    nav: 'Slot machine name picker',
    short: 'Slot Machine',
    published: '2026-11-22',
    updated: '2026-11-22',
    title: 'Slot Machine Name Picker: Free Random Name Slots | SpinDraw',
    description: 'Free slot machine name picker, like a fruit machine for names: pull the lever and the reels land on a random winner. Any list size, up to 50 winners.',
    h1: 'Slot machine name picker with a jackpot every time',
    lede: 'Paste your names and pull the lever. The symbol reels stop, the name reel slows down, creeps past a name or two, and lands on the winner. It handles lists of any size, from a classroom to a company of thousands.',
    answer: 'A slot machine name picker, sometimes called a fruit machine name picker, puts your names on a spinning reel and stops on a random winner when you pull the lever. SpinDraw’s slot machine is free, works with lists of any size, picks up to 50 winners with one pull each, and uses a locked fair draw with a verify link anyone can check.',
    glance: [
      ['Names', 'Any number, including thousands'],
      ['Winners', 'Up to 50, one pull each, in prize order'],
      ['Pull length', 'About 4, 6 or 8 seconds (Quick, Normal, Epic)'],
      ['Extras', 'Near misses, a jackpot coin shower and seasonal themes'],
      ['Odds', 'Exactly each entry’s share'],
      ['Price', 'Free, no account'],
    ],
    stepsTitle: 'How to pick a name with the slot machine',
    steps: [
      'Paste your names in the <strong>Entries</strong> tab above, one per line. Write <em>Name x3</em> to give someone three entries.',
      'Set <strong>How many winners?</strong> if you want more than one. Each winner gets their own pull.',
      'Click <strong>Lock entries</strong> in the Draw tab so everyone sees the code before the reels move.',
      'Press <strong>Pull the lever</strong> or Space. Click <strong>Present</strong> for a projector or stream.',
      'When you’re done, share the verify link so anyone can check every winner.',
    ],
    body: `
<h2>What people see</h2>
<ul>
  <li>A pixel slot machine with chasing lights, a lever and a big reel of names</li>
  <li>Two symbol reels that line up sevens when the winner lands</li>
  <li>A near miss now and then, when the reel creeps past a name before it settles</li>
  <li>A coin shower and a jackpot jingle for the winner</li>
</ul>
<h2>A fruit machine name picker for classrooms</h2>
<p>Teachers have used fruit-machine style name pickers for years to choose who answers next. This one runs in the browser with nothing to install and no slides to build: paste the class list, put it on the board with <strong>Present</strong>, and pull. Keep <strong>Remove winners</strong> on and each student is picked only once until you start a new round. More ideas are in the <a href="/classroom-name-picker/">classroom guide</a>.</p>
<h2>Big lists and many prizes</h2>
<p>The races and battles top out at 100 names, but the slot machine takes lists of any length, so it suits company-wide draws, big giveaways and long class lists. For many prizes, set up to 50 winners: pulls get a little quicker when there are lots of them, and each one is matched to the next prize on your list.</p>
<h2>Is the slot machine fair?</h2>
<p>Yes. It uses the same locked draw as the wheel: SpinDraw picks the winner fairly from your list first, then the reels land on that name. There are no paylines or odds to tune. Every entry has exactly its share of the chance, and the verify link proves the result came from the locked list.</p>`,
    faq: [
      ['How many names can the slot machine take?', 'Any number. Only the names in view are drawn, so lists of thousands spin smoothly.'],
      ['Is a slot machine name picker the same as a fruit machine name picker?', 'Yes. Fruit machine is the British name for a slot machine. Both put names on a reel and stop on a random winner.'],
      ['Can it pick several winners?', 'Yes, up to 50. Each winner gets their own pull, in prize order.'],
      ['Is the slot machine fair?', 'Yes. A fair draw from the locked list picks the winner before the reels move, so every entry has exactly its share of the chance. The verify link lets anyone check.'],
      ['Do I need PowerPoint or an app?', 'No. It runs in any modern browser on a laptop, tablet or phone, with nothing to install.'],
      ['Can I use it on a stream?', 'Yes. Add the overlay as a Browser source in OBS or Streamlabs, or click Present for a clean view.'],
    ],
  },
  {
    slug: 'random-bracket-generator',
    play: 'bracket',
    nav: 'Random bracket generator',
    short: 'Bracket',
    published: '2026-11-22',
    updated: '2026-11-22',
    title: 'Random Bracket Generator With Names – Free | SpinDraw',
    description: 'Free random bracket generator with names: paste 2 to 64 names and watch a single-elimination tournament of pixel duels crown a champion. Up to 4 winners.',
    h1: 'Random bracket generator with names',
    lede: 'Paste up to 64 names and SpinDraw builds a random single-elimination bracket. Names face off one on one, round by round, until a champion is crowned, with the semi-finals and final fought as full-screen pixel duels.',
    answer: 'A random bracket generator puts a list of names into a single-elimination tournament with random matchups. SpinDraw’s bracket is free, takes 2 to 64 names, hands out byes automatically, and plays every match out on screen to pick a champion, a runner-up and a third-place match. A locked fair draw picks the winners, so bracket position never changes anyone’s odds.',
    glance: [
      ['Names', '2 to 64'],
      ['Format', 'Single elimination, with a third-place match'],
      ['Winners', 'Up to 4: champion, runner-up, 3rd and 4th'],
      ['Byes', 'Automatic and random when the list isn’t 4, 8, 16, 32 or 64'],
      ['Length', 'Quick, Normal or Epic, from about 20 seconds'],
      ['Price', 'Free, no account'],
    ],
    stepsTitle: 'How to make a random bracket with names',
    steps: [
      'Paste 2 to 64 names in the <strong>Entries</strong> tab above, one per line.',
      'Set <strong>How many winners?</strong> up to 4.',
      'Click <strong>Lock entries</strong> in the Draw tab so everyone sees the code before the bracket starts.',
      'Press <strong>Start bracket</strong> or Space. Click <strong>Present</strong> for a projector or stream.',
      'Share the verify link afterwards. It shows the whole bracket, match by match.',
    ],
    body: `
<h2>What people see</h2>
<ul>
  <li>Early rounds played side by side, with winners lighting up and losers crossed out</li>
  <li>Semi-finals, a third-place match and the final as full-screen duels, with hits, dodges and blocks</li>
  <li>A champion’s scene with a crown, and places for everyone who wins a prize</li>
  <li>Seasonal themes that dress the fighters up for Christmas, Halloween and more</li>
</ul>
<h2>Bracket sizes and byes</h2>
<p>A single-elimination bracket needs a power of two: 4, 8, 16, 32 or 64 places. When your list is in between, some names get a bye, a free pass into round two. SpinDraw gives the byes to randomly chosen first-round matches.</p>
<div class="table-scroll"><table class="compare">
  <thead><tr><th>Names</th><th>Bracket size</th><th>Byes</th><th>Rounds</th></tr></thead>
  <tbody>
    <tr><td>5</td><td>8</td><td>3</td><td>3</td></tr>
    <tr><td>6</td><td>8</td><td>2</td><td>3</td></tr>
    <tr><td>10</td><td>16</td><td>6</td><td>4</td></tr>
    <tr><td>12</td><td>16</td><td>4</td><td>4</td></tr>
    <tr><td>20</td><td>32</td><td>12</td><td>5</td></tr>
    <tr><td>24</td><td>32</td><td>8</td><td>5</td></tr>
    <tr><td>40</td><td>64</td><td>24</td><td>6</td></tr>
  </tbody>
</table></div>
<h2>Random matchups, fair winners</h2>
<p>Matchups are random every time, and so are the byes. They still don’t change anyone’s chances: a fair draw from the locked list picks the winners first, the bracket plays out from a seed with nothing steered, and the drawn names go on the champion, runner-up and third-place slots. Every entry has exactly its share of the chance.</p>
<h2>Is this a bracket maker for real tournaments?</h2>
<p>It’s a bracket that plays itself out to pick winners, not a printable bracket you fill in as real games are played. It suits team events, classrooms, game nights, streams and “which is best” debates. To decide a random seeding or turn order for a real tournament, draw the whole list in order with the <a href="/ball-race-name-picker/">marble race</a> or the <a href="/random-name-picker/">wheel</a>.</p>`,
    faq: [
      ['How many names can a bracket have?', 'From 2 to 64. For bigger lists, use the wheel or the slot machine.'],
      ['How many winners can a bracket pick?', 'Up to 4: the champion, the runner-up, and third and fourth place from the third-place match.'],
      ['Are the matchups random?', 'Yes. The first-round matchups and the byes are random for every bracket.'],
      ['Do byes give anyone an advantage?', 'No. The winners come from a fair draw from the locked list, and the bracket only reveals them, so byes and bracket position don’t change anyone’s odds.'],
      ['Can I enter real match results or print the bracket?', 'No. The bracket plays itself out to pick winners. For a real tournament you play yourself, use it to draw a random order instead.'],
      ['Can I show it in OBS or on a projector?', 'Yes. Add the overlay as a Browser source, or click Present for a clean view.'],
    ],
  },
  {
    slug: 'online-bingo',
    play: 'bingo',
    nav: 'Online bingo',
    short: 'Bingo',
    published: '2026-11-24',
    updated: '2026-11-24',
    title: 'Online Bingo: Free Bingo Caller and Cards | SpinDraw',
    description: 'Free online bingo: a bingo caller for your big screen, cards on players’ phones or printed, 75-ball and 90-ball. For Zoom, parties and classrooms.',
    h1: 'Free online bingo: caller, cards and a fair draw',
    lede: 'Run bingo from one screen. SpinDraw calls the numbers, players get a card on their phone or on paper, and you check a winner by typing their card number. 75-ball or 90-ball, free, with no money involved.',
    answer: 'SpinDraw online bingo is a free bingo caller with cards. The host shows the caller on a big screen or a video call, players open their own card on their phone from a link or QR code (or use printed cards), and the host checks a winning card by its number. It supports 75-ball and 90-ball bingo, and the call order comes from a locked fair draw anyone can verify afterwards.',
    glance: [
      ['Bingo types', '75-ball (B-I-N-G-O) and 90-ball (UK and housie style)'],
      ['Cards', 'On phones from a link or QR code, or printed, up to 200 per printout'],
      ['One card per person', 'Optional: each player gets their own card and link, and only those cards can win'],
      ['Calls', 'Click or Space, or auto-call every 5 to 20 seconds, read aloud'],
      ['Prizes', '75-ball: any line, four corners, letter X, blackout or your own custom pattern. 90-ball: one line, two lines, full house'],
      ['Fairness', 'Call order locked before the first number, with a verify link afterwards'],
      ['Price', 'Free, no sign-up, no money involved'],
    ],
    stepsTitle: 'How to host online bingo',
    steps: [
      'Choose <strong>75-ball</strong> or <strong>90-ball</strong>, and pick what you’re playing for.',
      'Share the <strong>player link</strong> in your chat, let people scan the QR code on screen, or click <strong>Print cards</strong>.',
      'Click <strong>Lock game</strong> so everyone sees the code that commits to the call order. Optionally, ask someone for a public word.',
      'Press <strong>Call next</strong> or Space, or turn on auto-call. Click <strong>Present</strong> to show the caller full screen.',
      'When someone shouts bingo, type their <strong>card number</strong> under <strong>Check a card</strong> and confirm the win.',
      'When you’re done, click <strong>Finish &amp; create verify link</strong> and share it.',
    ],
    body: `
<h2>Playing on Zoom, Teams, Meet or a stream</h2>
<p>Share your screen and click <strong>Present</strong> for a clean, full-screen caller with the board, the last calls and the QR code. Paste the player link in the meeting chat. Each person’s phone opens their own card, and they tap numbers as you call them. Their phones don’t need to connect to yours, so it works on any network. For a live stream, show the Present view and put the player link in your description or chat.</p>
<h2>Playing in a room</h2>
<p>Put the caller on a TV or projector. Guests scan the QR code to get a card on their phone, or you hand out printed cards. Calls can be read aloud in the browser’s voice, so a classroom or party can follow along without anyone reading the numbers.</p>
<h2>75-ball vs 90-ball bingo</h2>
<div class="table-scroll"><table class="compare">
  <thead><tr><th></th><th>75-ball</th><th>90-ball</th></tr></thead>
  <tbody>
    <tr><td>Where it’s popular</td><td>US and Canada</td><td>UK, Ireland, Australia, India (housie or tambola)</td></tr>
    <tr><td>Card</td><td>5 × 5 grid under B-I-N-G-O, free centre square</td><td>3 rows × 9 columns, 15 numbers, 5 in each row</td></tr>
    <tr><td>Numbers</td><td>1 to 75, called with a letter, like “B 12”</td><td>1 to 90</td></tr>
    <tr><td>Prizes in SpinDraw</td><td>Any line, four corners, letter X, blackout or a custom pattern you draw</td><td>One line, then two lines, then full house</td></tr>
  </tbody>
</table></div>
<h2>Printable bingo cards</h2>
<p>Click <strong>Print cards</strong> to print numbered cards for the current game: two 75-ball cards or six 90-ball tickets per page. Printed cards and phone cards come from the same game code, so you can mix them in one game. Check any of them the same way, by card number.</p>
<h2>Custom bingo patterns</h2>
<p>In 75-ball, choose <strong>Custom pattern…</strong> under <strong>Playing for</strong> and click squares on the 5 × 5 grid to draw any shape: a letter, a frame, a diamond or a postage stamp in the corner. Start from a ready-made shape like Letter T, Plus or Frame, then change it, and give it a name if you like. The pattern shows on the big screen so players know what they’re going for, and checking a card works the same way. The free centre always counts as marked.</p>
<h2>One card per person</h2>
<p>For a prize game where fairness matters, turn on <strong>One card per person</strong> and paste your player list. Each name gets its own numbered card and a personal link to send them, or print named cards. Nobody shares a card or gets a second one, and only assigned cards can win: if someone shouts bingo on a card that isn’t on the list, the check says so. The player list is locked in with the game before the first call, so the verify link also proves nobody was moved onto a winning card.</p>
<h2>Checking a winner</h2>
<p>Type the card number a player shouts out. SpinDraw rebuilds that card from the game code, marks every number called so far and says whether it has the pattern, for example “BINGO! #0042: row 2”, or how many numbers it still needs. Confirm the win and it’s logged with the prize and the call it won on. In 90-ball, the prize moves on from one line to two lines to full house automatically.</p>
<h2>Is the bingo caller fair?</h2>
<p>Yes. When you lock the game, SpinDraw picks a secret seed and shows a code that commits to the call order before the first number. Cards come from a separate public game code, so knowing a card tells you nothing about the calls. When the game ends, the seed is revealed and the verify link lets anyone rebuild every call in order and check each winning card against the numbers called before it won.</p>
<h2>Ideas for virtual bingo</h2>
<ul>
  <li><strong>Team building:</strong> a quick 75-ball line game to open a meeting, or blackout for a longer social.</li>
  <li><strong>Classrooms:</strong> practise number recognition, with calls read aloud.</li>
  <li><strong>Parties and family calls:</strong> 90-ball with three prizes keeps everyone in the game longer.</li>
  <li><strong>Fundraisers and events:</strong> printed cards in the room, the caller on the big screen.</li>
</ul>
<p>SpinDraw bingo is for fun. There’s no buying in, no money and nothing to win from SpinDraw itself. Any prizes are up to you.</p>`,
    faq: [
      ['Is SpinDraw online bingo free?', 'Yes. The caller, phone cards and printable cards are free, with no sign-up and no money involved.'],
      ['How do players get a bingo card?', 'Share the player link or show the QR code. Each phone that opens it gets its own card, which stays the same if they refresh. You can also print numbered cards.'],
      ['Do players’ cards mark themselves?', 'No. Players tap numbers as they’re called, like daubing a paper card. Their phones don’t need to connect to the host, so it works on any network.'],
      ['Can two players get the same card?', 'With the open player link, each phone picks one of 9,999 cards at random, so repeats are rare in small groups but possible in big ones. Turn on One card per person to give everyone their own numbered card instead, so nobody shares a card. Printed cards are numbered in order, so they never repeat.'],
      ['Can I make sure everyone only plays one card?', 'Yes. Turn on One card per person and paste your player list. Each name gets its own card and personal link, only those cards can win, and the list is locked in with the game, so the verify link shows nobody was moved onto a winning card.'],
      ['How do I check if someone has bingo?', 'Type their card number under Check a card. SpinDraw shows the card with the called numbers marked and says whether it has the pattern you’re playing for.'],
      ['What’s the difference between 75-ball and 90-ball bingo?', '75-ball uses a 5 × 5 card under B-I-N-G-O with a free centre and patterns like lines or blackout. 90-ball uses a 3 × 9 ticket with 15 numbers and prizes for one line, two lines and a full house.'],
      ['Can I make my own bingo pattern?', 'Yes, in 75-ball. Choose Custom pattern under Playing for, click squares to draw the shape or start from one like Letter T, Plus or Frame, and name it if you like. It shows on the big screen, and card checks and the verify link use it.'],
      ['Can the caller read numbers aloud?', 'Yes. Turn on Read calls aloud and your browser’s voice announces each number, like “B, 12”.'],
      ['Can I use it on Zoom or Teams?', 'Yes. Share your screen with the Present view, and paste the player link in the meeting chat.'],
    ],
  },
];

// One row per game for the "Which game should you use?" table on every game page.
export const GAME_TABLE = [
  ['random-name-picker', 'Wheel', 'Quick picks and huge lists', 'Thousands', 'One per spin', '3 to 15 s a spin'],
  ['slot-machine-name-picker', 'Slot machine', 'Big lists with suspense', 'Thousands', 'Up to 50', 'About 4 to 8 s a pull'],
  ['ball-race-name-picker', 'Marble race', 'Giveaways, draft orders', 'Up to 100', 'Up to 50, in order', '20 to 60 s'],
  ['horse-race-name-picker', 'Horse race', 'Parties, draft orders', 'Up to 100', 'Up to 50, in order', '20 to 60 s'],
  ['battle-royale-name-picker', 'Pixel battle', 'Streams and game nights', 'Up to 100', 'Up to 50', '20 to 60 s'],
  ['random-bracket-generator', 'Bracket', 'Head-to-head showdowns', '2 to 64', 'Up to 4', 'About 20 to 60 s'],
];
