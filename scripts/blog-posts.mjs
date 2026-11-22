// Blog posts. Each one becomes /blog/<slug>/, appears on /blog/, in the RSS feed, in the sitemap
// and on the home page. To add a post, add an object here (newest first) and run
// `node scripts/build-pages.mjs`. Facts about SpinDraw must match what the app really does.

export const AUTHOR = { name: 'Vincent Carl Benlot', url: '/about/' };

export const POSTS = [
  {
    slug: 'are-name-picker-games-fair',
    title: 'Are Name Picker Games Fair? Marble Races, Battles and Wheels',
    description: 'Marble races and battle royale name pickers are fun, but many don’t give every entry the same odds. How to tell, and how to run a fair game draw.',
    h1: 'Are name picker games fair? Marble races, battles and wheels explained',
    date: '2026-11-22',
    updated: '2026-11-22',
    cover: '/media/blog/covers/are-name-picker-games-fair.jpg',
    coverAlt: 'A flat illustration of a balance scale holding marbles on one side and a pixel knight and toy horse on the other, in front of a prize wheel and a shield with a check mark',
    shot: '/media/blog/fun-ways-to-pick-a-winner.jpg',
    shotAlt: 'Four ways to pick a winner in SpinDraw: a spinning name wheel, a ball race, a horse race and a pixel battle',
    shotCaption: 'In SpinDraw, the wheel, Ball Race, Horse Race and Pixel Battle all reveal the same fair, locked draw.',
    answer: 'Not always. Many marble race and battle royale pickers let the physics or the fight decide the winner, so the course, the start positions or a fighter’s abilities can tilt the odds. A game picker is fair when every entry has exactly the same chance, which means the winner has to come from a fair random draw, with the race or battle only revealing it.',
    body: `
<h2>Why a game can be less fair than a wheel</h2>
<p>A spinning wheel is easy to reason about: every slice is the same size, so every name has the same chance. Races and battles are different. When the winner is simply whoever finishes first or survives longest, the result depends on everything that happens along the way. Little things add up:</p>
<ul>
  <li><strong>Start positions.</strong> A marble that starts in the middle may get a cleaner line down the course than one stuck on the edge.</li>
  <li><strong>The course itself.</strong> Some layouts favour certain lanes, or let a pack block the balls behind it.</li>
  <li><strong>Abilities and classes.</strong> In battle games, a tougher fighter type or a lucky ability makes some names more likely to win.</li>
  <li><strong>Extra entries.</strong> Giving someone five marbles roughly gives them more chances, but only if every marble has the same chance to begin with.</li>
</ul>
<p>None of that is a problem when you’re picking who buys the coffee. It matters a lot more when there’s a prize, a paying crowd or a stream full of people watching.</p>

<h2>What popular game pickers say about their own odds</h2>
<p>To their credit, some tools say this openly. Roulette Rush, a marble race picker, says on its own site that <a href="https://rouletterush.app/" rel="noopener">equal entries don’t guarantee equal winning chances</a>, and that its results aren’t audited random draws. Namebrawl, a pixel battle picker, says its battles aren’t <a href="https://namebrawl.com/" rel="noopener">an equal-probability draw</a>, because a fighter’s class and abilities affect the outcome. Both are fun, and both are upfront about it, so read the fine print before you use any game for a real raffle.</p>

<h2>How to make a game draw fair</h2>
<p>The fix is to separate picking the winner from showing the winner. First, a fair random draw picks the winner from the full list, with each entry getting exactly its share of the odds. Then the race or battle plays out and reveals that winner. The game adds the suspense, and the draw keeps it fair.</p>
<p>That’s how SpinDraw works. When you start a Ball Race, Horse Race or Pixel Battle, a fair draw from your locked list picks the winner first. The game then runs a real, unsteered simulation, and the winner’s name goes on whichever ball, horse or fighter comes out on top, while everyone else is shuffled over the rest. Every entry has exactly the same chance as it would on the wheel, and extra entries like <em>Maria x3</em> count exactly three times.</p>
<p>It’s a bit like a scratchcard: the result is decided when the card is printed, and scratching it is the fun part. Nobody watching can tell in advance who’s going to win, and nobody can steer it.</p>

<h2>Fair is good, provable is better</h2>
<p>Even a fair draw leaves one question: how do people know you didn’t run it again until a friend won? SpinDraw locks the list and a secret seed behind a code shown on screen before anything moves. Afterwards, a verify link lets anyone re-run every draw and check the winners came from that exact list. On the verify page you can also see the match itself rebuilt, from the finishing order of a race to every knockout in a battle. For extra trust, ask someone in the room or in chat for a random word after you lock the list, and mix it in.</p>

<h2>Quick checklist before you use a game for a giveaway</h2>
<ol>
  <li>Does the tool say every entry has the same chance? Look for it in the FAQ.</li>
  <li>Do extra entries count exactly, or just add more marbles or fighters?</li>
  <li>Is the list locked before the game starts?</li>
  <li>Can anyone check the result afterwards, not just watch a recording?</li>
  <li>Can it pick several winners if you have several prizes?</li>
</ol>
<p>If the answer to the first question is no, use the game for fun and a fair draw for the prize. Our <a href="/random-name-picker-alternatives/">comparison of name picker alternatives</a> covers how each popular tool handles this, and <a href="/blog/how-to-pick-a-random-winner-for-a-giveaway/">how to pick a random winner for a giveaway</a> walks through the whole process.</p>`,
    faq: [
      ['Are marble race name pickers fair?', 'Some aren’t. When the first marble across the line simply wins, start positions and the course can tilt the odds, and some tools say so themselves. A marble race is only fully fair when a random draw picks the winner and the race reveals it.'],
      ['Do battle royale name pickers give everyone the same chance?', 'Not always. If fighters have different classes or abilities, some names are more likely to win. Look for a picker where a fair draw decides and the battle only reveals the result.'],
      ['If the winner is drawn first, is the race fake?', 'The race is a real simulation that nobody steers. It just isn’t what picks the winner: the fair draw does, and the winner’s name goes on whoever comes out on top. Think of it like scratching a scratchcard.'],
      ['How can people check a game draw was fair?', 'Use a picker that locks the list before the draw and gives you a verify link afterwards. Anyone can then re-run the draw and confirm the winner came from the locked list.'],
    ],
    cta: {
      heading: 'Run a game draw that’s actually fair',
      text: 'Race balls or horses, or start a pixel battle. Every entry gets exactly its share of the chance, and anyone can check the result.',
      primary: { label: 'Start a fair ball race', href: '/app.html?mode=race' },
      secondary: { label: 'Try the pixel battle', href: '/app.html?mode=battle' },
    },
  },
  {
    slug: 'new-year-raffle-ideas',
    title: 'New Year Raffle Ideas: Lucky Draw Prizes and Formats for 2027',
    description: 'New Year raffle and lucky draw ideas for year-end parties: prize ideas, fun draw formats, a midnight grand prize, and how to keep the draw fair.',
    h1: 'New Year raffle ideas for your year-end party and lucky draw',
    date: '2026-11-22',
    updated: '2026-11-22',
    cover: '/media/blog/covers/new-year-raffle-ideas.jpg',
    coverAlt: 'A flat illustration of a New Year raffle: a ticket drum full of coloured tickets, wrapped prizes, balloons, a party hat, fireworks and a clock near midnight',
    shot: '/media/blog/new-year-raffle-ideas.jpg',
    shotAlt: 'A New Year-themed horse race in SpinDraw: gold and silver horses with party-hat riders, confetti and fireworks over the stands',
    shotCaption: 'With the New Year theme on, the Horse Race gets gold and silver horses, party hats, confetti and fireworks.',
    answer: 'A good New Year raffle has free entry for everyone, lots of small prizes through the night and one big prize near midnight, with the draw shown on a big screen or video call. Below are prize ideas, five draw formats and a simple plan for the night.',
    body: `
<h2>What makes a good New Year lucky draw?</h2>
<p>A year-end lucky draw is often the most talked-about part of the party, especially at company events. The ones that go well tend to share a few things:</p>
<ul>
  <li><strong>Everyone is in.</strong> One free entry each, including people joining from home.</li>
  <li><strong>The prizes are spread out.</strong> Many small prizes keep people watching, and one big one gives the night a finale.</li>
  <li><strong>The draws happen in rounds.</strong> A few prizes every hour beats forty in a row while dessert goes cold.</li>
  <li><strong>Everyone can see the draw.</strong> On a big screen or a shared screen, so nobody wonders who arranged it.</li>
</ul>

<h2>New Year raffle prize ideas</h2>
<div class="table-scroll"><table class="compare">
  <thead><tr><th>Small prizes</th><th>Mid-range prizes</th><th>Grand prize</th></tr></thead>
  <tbody>
    <tr><td>A calendar or planner for the new year</td><td>Wireless earbuds or a smartwatch</td><td>A new phone or tablet</td></tr>
    <tr><td>Coffee shop or food delivery vouchers</td><td>A hotel staycation voucher</td><td>A weekend trip for two</td></tr>
    <tr><td>A desk plant or a good mug</td><td>A gym or fitness class pass, for the resolutions</td><td>Cash or a large gift card</td></tr>
    <tr><td>Movie tickets</td><td>A kitchen gadget like an air fryer</td><td>Extra days of annual leave</td></tr>
    <tr><td>An extra hour of leave</td><td>A spa voucher</td><td>A charity donation in the winner’s name, matched by the company</td></tr>
  </tbody>
</table></div>
<p>Resolution-themed prizes go down well at this time of year: running shoes, a cookbook, a language app subscription or a journal.</p>

<h2>Five fun ways to run the draw</h2>
<ol>
  <li><strong>Hourly draws, grand prize at midnight.</strong> Draw a few small prizes every hour, then save the big one for the countdown.</li>
  <li><strong>Twelve prizes for twelve months.</strong> Name each prize after a month of the coming year and draw them in order.</li>
  <li><strong>A New Year horse race.</strong> Every name gets a horse, and with the New Year theme on, the field turns gold and silver with party-hat riders and fireworks. You can let the first three across the line win at once. See the <a href="/horse-race-name-picker/">horse race picker</a>.</li>
  <li><strong>A last-one-standing battle.</strong> Fighters in party hats, top hats and tiaras battle it out, and the last few standing win.</li>
  <li><strong>The classic wheel.</strong> Quick and familiar, and it handles a company of any size. Our guide to the <a href="/random-name-picker/">random name picker wheel</a> shows how.</li>
</ol>

<h2>How to keep a year-end lucky draw fair</h2>
<p>Year-end draws often come with big prizes, so expect someone to ask whether it was fixed. Lock the list before the first draw so nobody can be added or removed, ask a guest rather than the organiser for a random word to mix in, and share a verify link afterwards so anyone can check every winner. Our guide on <a href="/blog/how-to-pick-a-random-winner-for-a-giveaway/">picking a random winner and proving it was fair</a> covers the details, and the <a href="/office-raffle/">office raffle guide</a> covers running it for a team.</p>

<h2>Check the rules if people pay to enter</h2>
<p>A free lucky draw is usually simple. If guests buy tickets, many countries treat it as a lottery with rules attached. In the UK, the Gambling Commission publishes <a href="https://www.gamblingcommission.gov.uk/news/article/advice-on-running-lotteries-and-raffles-during-the-festive-season" rel="noopener">advice on running raffles during the festive season</a>. Check the rules where you are. This isn’t legal advice.</p>

<h2>A simple plan for the night</h2>
<ol>
  <li>A week before: collect names and agree the prizes, smallest to biggest.</li>
  <li>On the day: paste the names into SpinDraw, add the prizes in draw order and turn on the New Year theme.</li>
  <li>At the party: lock the list, ask a guest for a random word, then draw a round every hour.</li>
  <li>Just before midnight: draw the grand prize, then post the winners and the verify link in the group chat.</li>
</ol>
<p>Running a Christmas party too? See our <a href="/blog/office-christmas-raffle-ideas/">office Christmas raffle ideas</a>.</p>`,
    faq: [
      ['What is a good grand prize for a New Year raffle?', 'Something people can enjoy in the new year: a trip, a new phone, a large gift card or extra days of leave. Pair it with plenty of smaller prizes so more people win something.'],
      ['How do you run a lucky draw at a year-end party?', 'Give everyone one free entry, draw small prizes in rounds through the night, and save the grand prize for the countdown. Show the draw on a big screen so everyone can watch.'],
      ['How can several people win at once?', 'In SpinDraw’s Ball Race, Horse Race and Pixel Battle, set “How many winners?” and the first ones across the line, or the last ones standing, all win in one round.'],
      ['Do I need a permit for a New Year raffle?', 'Usually not if entry is free. If people pay for tickets, many countries treat it as a lottery with rules or permits. Check the rules where you are.'],
    ],
    cta: {
      heading: 'Run your New Year lucky draw',
      text: 'Paste your guest list, turn on the New Year theme and let gold horses race for the prizes. Free, and no sign-up.',
      primary: { label: 'Start a New Year horse race', href: '/app.html?mode=horse&theme=newyear' },
      secondary: { label: 'Spin a New Year wheel', href: '/app.html?mode=wheel&theme=newyear' },
    },
  },
  {
    slug: 'office-christmas-raffle-ideas',
    title: 'Office Christmas Raffle Ideas: Prizes, Formats and a Fair Draw',
    description: 'Office Christmas raffle ideas that work: prize ideas at every budget, five ways to run the draw, and how to keep it fair for remote and hybrid teams.',
    h1: 'Office Christmas raffle ideas people actually look forward to',
    date: '2026-11-07',
    updated: '2026-11-07',
    cover: '/media/blog/covers/office-christmas-raffle-ideas.jpg',
    coverAlt: 'A flat illustration of an office Christmas raffle: a ticket drum full of coloured raffle tickets on a desk, with wrapped prizes, a small Christmas tree and string lights',
    shot: '/media/blog/office-christmas-raffle.jpg',
    shotAlt: 'A Christmas-themed horse race in SpinDraw: reindeer with antlers and Santa-capped riders racing on a snowy track, with a live leaderboard',
    shotCaption: 'The Christmas theme turns the Horse Race into a reindeer race.',
    answer: 'A good office Christmas raffle is free to enter, has lots of small prizes plus one big one, and ends with a draw everyone can watch, in the room or on a video call. Below you’ll find prize ideas for every budget, five ways to run the draw, and how to keep it fair for people working from home.',
    body: `
<h2>What makes an office Christmas raffle work?</h2>
<p>The raffles people remember aren’t the ones with the biggest prize. They’re the ones where lots of people won something, nobody felt left out, and the draw was a bit of a show. Get a few basics right and the rest takes care of itself:</p>
<ul>
  <li><strong>Keep entry free.</strong> Give everyone one entry, or one per year of service if you want a nod to long-timers. Free entry also keeps you clear of most raffle rules (more on that below).</li>
  <li><strong>Spread the prizes.</strong> Ten small prizes beat one expensive one. More winners means more cheering.</li>
  <li><strong>Draw in front of everyone.</strong> Put the draw on the big screen, or share your screen on the call, so nobody wonders whether it was rigged.</li>
  <li><strong>Include remote staff properly.</strong> Their names go in the same list, and they watch the same draw.</li>
</ul>

<h2>Office Christmas raffle prize ideas by budget</h2>
<p>Mix a few from each column. Prizes the company can give without spending much, like time off, often go down best.</p>
<div class="table-scroll"><table class="compare">
  <thead><tr><th>Small prizes</th><th>Mid-range prizes</th><th>The big prize</th></tr></thead>
  <tbody>
    <tr><td>Coffee shop or food delivery voucher</td><td>Wireless earbuds or a smart speaker</td><td>An extra day of annual leave</td></tr>
    <tr><td>A desk plant or a nice mug</td><td>Dinner for two voucher</td><td>A weekend getaway voucher</td></tr>
    <tr><td>Cinema tickets</td><td>A good board game or a hamper</td><td>A new phone, tablet or gaming console</td></tr>
    <tr><td>A late start or early finish</td><td>A spa or massage voucher</td><td>A charity donation in the winner’s name, matched by the company</td></tr>
    <tr><td>Choice of the next team lunch spot</td><td>A premium parking spot for a month</td><td>A paid experience day of their choice</td></tr>
  </tbody>
</table></div>
<p>Draw the small prizes first and save the big one for last. It keeps people watching until the end.</p>

<h2>Five ways to run the draw</h2>
<ol>
  <li><strong>Names in a hat.</strong> Classic and quick, but nobody can check it afterwards, and it doesn’t work for people on a call.</li>
  <li><strong>A spinning wheel on the big screen.</strong> Familiar, fast, and it handles a whole company of names. <a href="/random-name-picker/">Here’s how a name picker wheel works</a>.</li>
  <li><strong>A reindeer race.</strong> Every name gets a horse, and with the Christmas theme on, they become reindeer with antlers and red noses. The first across the line wins. It takes about half a minute and the room will shout at the screen. See the <a href="/horse-race-name-picker/">horse race picker</a>.</li>
  <li><strong>A last-one-standing battle.</strong> Names become little pixel fighters in Santa hats and elf hats. Good for a crowd who like a bit of chaos.</li>
  <li><strong>Everyone wins, in order.</strong> If you have a prize for every person, draw the whole list. The order decides who picks their prize first.</li>
</ol>

<h2>How do you run a raffle for a hybrid or remote team?</h2>
<p>Put everyone in one list, whether they’re in the office or at home. Share your screen on Zoom, Google Meet or Microsoft Teams so everyone sees the same draw. Give each winner a minute to unmute and claim. If someone has stepped away, redraw that prize rather than holding up the party.</p>
<p>People in other time zones will ask whether it was fair. In SpinDraw you can lock the list before the draw and share a verify link afterwards, so anyone can re-run the draw and check the result came from that exact list. Our <a href="/office-raffle/">office raffle guide</a> walks through it step by step.</p>

<h2>Do you need a licence for an office raffle?</h2>
<p>A free raffle, where nobody pays to enter, is usually simple. Once people buy tickets, even for charity, many countries treat it as a lottery with rules attached. In the UK, for example, the Gambling Commission explains <a href="https://www.gamblingcommission.gov.uk/authorities/codes-of-practice/guide/page/how-to-run-a-lottery-with-people-you-work-with" rel="noopener">how to run a lottery with people you work with</a> and <a href="https://www.gamblingcommission.gov.uk/public-and-players/guide/page/types-of-lottery-you-can-run-without-a-licence" rel="noopener">which raffles you can run without a licence</a>. Rules differ by country, so check yours if money changes hands. This isn’t legal advice.</p>

<h2>A simple plan for the day</h2>
<ol>
  <li>A week before: collect names from your staff list and agree the prizes.</li>
  <li>The day before: paste the names in, add the prizes in draw order, and pick a theme.</li>
  <li>At the party: lock the list, ask a colleague (not the organiser) for a random word, and start the draw.</li>
  <li>Afterwards: post the winners and the verify link in the team chat.</li>
</ol>`,
    faq: [
      ['How many prizes should an office Christmas raffle have?', 'A good rule of thumb is one prize for every five to ten people, with lots of small prizes and one big one at the end. More winners keeps more people engaged.'],
      ['How do I stop the same person winning twice?', 'Remove each winner from the draw once they’ve won. In SpinDraw, keep Remove winners turned on in the Prizes tab and every name can only win once.'],
      ['Can remote employees take part in the office raffle?', 'Yes. Put everyone in the same list and share your screen on the video call so remote staff see the same draw at the same time.'],
      ['Do we need a licence for an office Christmas raffle?', 'Usually not if entry is free. If people pay for tickets, many countries treat it as a lottery with rules or permits. Check the rules where you are. This isn’t legal advice.'],
    ],
    cta: {
      heading: 'Run your Christmas draw with reindeer',
      text: 'Paste your staff list, turn on the Christmas theme and let the reindeer race for the prizes. Free, and no sign-up.',
      primary: { label: 'Start a reindeer race', href: '/app.html?mode=horse&theme=christmas' },
      secondary: { label: 'Spin a Christmas wheel', href: '/app.html?mode=wheel&theme=christmas' },
    },
  },
  {
    slug: 'secret-santa-rules',
    title: 'Secret Santa Rules: A Simple Guide for Work, Family and Friends',
    description: 'Secret Santa rules that keep everyone happy: setting a budget, drawing names fairly, wishlists, deadlines, office etiquette and a fun reveal.',
    h1: 'Secret Santa rules: a simple guide for work, family and friends',
    date: '2026-11-07',
    updated: '2026-11-07',
    cover: '/media/blog/covers/secret-santa-rules.jpg',
    coverAlt: 'A flat illustration of a Secret Santa gift exchange: hands passing wrapped presents around a Santa hat filled with folded name slips',
    shot: '/media/blog/secret-santa-rules.jpg',
    shotAlt: 'A Christmas-themed pixel battle in SpinDraw: fighters in Santa hats, elf hats and antlers on a snowy arena with pine trees',
    shotCaption: 'With the Christmas theme on, Pixel Battle fighters wear Santa hats, elf hats and antlers.',
    answer: 'The core Secret Santa rules are: agree a spending limit, draw names so nobody gets themselves, set a date for the swap, share wishlists, keep your person secret until the reveal, and keep gifts suitable for everyone in the group. Agree these up front and the whole thing runs itself.',
    body: `
<h2>What is Secret Santa?</h2>
<p>Secret Santa is a gift exchange where everyone draws one person’s name and buys a present for them, without saying who they drew. It goes by plenty of names: Kris Kringle in Ireland and Australia, Wichteln in Germany, Amigo Secreto across Latin America and Monito-Monita in the Philippines. <a href="https://en.wikipedia.org/wiki/Secret_Santa" rel="noopener">Wikipedia has a good overview</a> if you’re curious about the history.</p>

<h2>The six Secret Santa rules to agree first</h2>
<ol>
  <li><strong>Set a spending limit.</strong> Pick one number and stick to it, so nobody feels outdone or out of pocket. For work groups, keep it low enough that it’s easy for everyone.</li>
  <li><strong>Draw names fairly.</strong> Nobody should get themselves, and nobody should be able to fix who gets whom. More on this below.</li>
  <li><strong>Set the dates.</strong> One deadline to join, one date for the draw, and one date for the swap.</li>
  <li><strong>Share wishlists, or at least a hint.</strong> Three ideas from each person saves a lot of guessing and a lot of bath sets.</li>
  <li><strong>Keep it secret.</strong> Don’t tell your person, and don’t trade names behind the organiser’s back.</li>
  <li><strong>Keep gifts suitable.</strong> At work especially, skip anything that could embarrass someone. If it’s a gag gift, it should be funny for the person opening it too.</li>
</ol>

<h2>How do you draw names for Secret Santa fairly?</h2>
<p>Names in a hat has two problems: someone eventually draws their own name, and the last few people can work out who has whom. A neater method is a gift chain. Put everyone in a random order, then each person buys for the next person in the order, and the last person buys for the first. Because it’s one big loop, nobody can get themselves.</p>
<p>You can make that random order with a spinning wheel. Spin until the wheel is empty and the draw order is your chain. Our <a href="/secret-santa-name-picker/">Secret Santa name picker guide</a> shows exactly how, including how to keep the pairs private.</p>
<p>One honest limit: SpinDraw doesn’t do exclusion rules, like keeping partners apart, and it doesn’t email people their match. If you need those, a dedicated Secret Santa app is the better choice.</p>

<h2>Extra Secret Santa rules for the office</h2>
<ul>
  <li><strong>Make it optional.</strong> Some people can’t or don’t want to join. That should be fine, with no questions asked.</li>
  <li><strong>Keep the budget low and fixed.</strong> It protects junior staff from feeling pressure to spend.</li>
  <li><strong>Agree what’s off limits.</strong> Alcohol, joke gifts about appearance and anything too personal are common no-gos at work.</li>
  <li><strong>Plan for remote colleagues.</strong> Give an earlier deadline so gifts arrive by post in time, or allow e-gift cards.</li>
</ul>

<h2>Fun ways to do the reveal</h2>
<p>The reveal is half the fun. Have everyone guess their Secret Santa before they’re told. Or open gifts one at a time, in an order you draw at random, so it doesn’t drag. On a video call, draw the opening order live on screen so everyone sees who’s next.</p>

<h2>Secret Santa vs white elephant: what’s the difference?</h2>
<p>In Secret Santa, you buy for one specific person. In a <a href="https://en.wikipedia.org/wiki/White_elephant_gift_exchange" rel="noopener">white elephant gift exchange</a>, also called a Yankee swap, everyone brings one gift for the pile, then people take turns choosing or stealing. White elephant needs no drawing of names, just a fair turn order, which you can draw the same way.</p>`,
    faq: [
      ['What is a good Secret Santa budget?', 'Pick an amount everyone in the group can comfortably afford and keep it fixed. For work groups, a low limit is kinder, because it stops anyone feeling pressure to spend more than they want to.'],
      ['How do you make sure nobody draws their own name in Secret Santa?', 'Use a gift chain: put everyone in a random order, each person buys for the next one, and the last person buys for the first. It’s one big loop, so nobody can get themselves.'],
      ['Can you do Secret Santa remotely?', 'Yes. Draw names online, set an earlier deadline so posted gifts arrive in time, or allow e-gift cards, then do the reveal on a video call.'],
      ['Is Secret Santa the same as Kris Kringle?', 'Yes. Kris Kringle, Wichteln, Amigo Secreto and Monito-Monita are local names for the same idea: drawing one person’s name and buying them a gift in secret.'],
    ],
    cta: {
      heading: 'Draw your Secret Santa names fairly',
      text: 'Make a random gift chain in under a minute: nobody gets themselves, and you get a link that proves it wasn’t arranged.',
      primary: { label: 'Read the name-draw guide', href: '/secret-santa-name-picker/' },
      secondary: { label: 'Open the Christmas wheel', href: '/app.html?mode=wheel&theme=christmas' },
    },
  },
  {
    slug: 'how-to-pick-a-random-winner-for-a-giveaway',
    title: 'How to Pick a Random Winner for a Giveaway (and Prove It Was Fair)',
    description: 'How to pick a random giveaway winner step by step: collect entries from comments, remove duplicates, draw live and share proof that nobody rigged it.',
    h1: 'How to pick a random winner for a giveaway, and prove it was fair',
    date: '2026-11-07',
    updated: '2026-11-07',
    cover: '/media/blog/covers/how-to-pick-a-random-winner-for-a-giveaway.jpg',
    coverAlt: 'A flat illustration of an online giveaway: a phone showing a prize wheel, comment bubbles, a wrapped prize and a shield with a check mark for a fair draw',
    shot: '/media/blog/random-giveaway-winner.jpg',
    shotAlt: 'The SpinDraw name picker wheel with eight names on coloured slices, ready to spin',
    shotCaption: 'The SpinDraw wheel, ready to pick a giveaway winner.',
    answer: 'To pick a random giveaway winner, put every valid entry into one list, remove duplicates, lock the list, then draw the winner with a random tool your audience can watch. Give the winner a set time to claim, redraw if they don’t, and share proof of the draw so nobody can say it was rigged.',
    body: `
<h2>Step by step: picking a giveaway winner</h2>
<ol>
  <li><strong>Close entries at the time you announced.</strong> Late entries are the first thing people complain about.</li>
  <li><strong>Gather every entry into one list.</strong> Comments, form responses or a spreadsheet, one name per line.</li>
  <li><strong>Remove duplicates and invalid entries.</strong> One person, one entry, unless your rules said otherwise.</li>
  <li><strong>Lock the list.</strong> Freeze it before the draw so nobody can be quietly added or removed.</li>
  <li><strong>Draw live.</strong> On stream, on a screen share or recorded, so people see the winner come out.</li>
  <li><strong>Give the winner a claim window.</strong> Say how long they have to reply, and redraw if they don’t.</li>
  <li><strong>Share the proof.</strong> Post something people can check, not just a screenshot.</li>
</ol>

<h2>How do you get entries out of comments?</h2>
<p>Most giveaways run in the comments. The fiddly part is turning a messy comment thread into a clean list of names. In SpinDraw you copy the comments from Facebook, YouTube or TikTok, paste them in, and choose the copied-comments format. The likes, timestamps and “Reply” links are stripped out, and you can count only comments that contain your keyword, like #JOIN. If you collected entries with Google Forms, import the sheet or a CSV instead. Our <a href="/facebook-live-raffle/">Facebook Live raffle guide</a> covers the comment method in detail.</p>

<h2>Should duplicate entries count?</h2>
<p>Usually not. If one person comments ten times, keeping all ten gives them ten times the chance, which isn’t what most giveaways intend. Turn on “one entry per person” before you draw.</p>
<p>If you do want bonus entries, for example for people who shared the post, say so in the rules first. In SpinDraw you can write <em>Maria Santos x3</em> to give someone three entries, and the verify page lists every weight, so it stays out in the open.</p>

<h2>Why “random” isn’t enough</h2>
<p>Almost any picker is random enough. The real question your audience has is different: how do they know you didn’t spin again until a friend won, or quietly drop a name? A screenshot can’t answer that, because it only shows the attempt you chose to post.</p>
<p>The fix is to commit before you draw. SpinDraw locks your list and a secret random seed behind a code that’s shown on screen before anything moves. After the draw it reveals the seed, so anyone can re-run the draw and get the same winner. Cryptographers call this a <a href="https://en.wikipedia.org/wiki/Commitment_scheme" rel="noopener">commitment scheme</a>. For extra trust, ask a viewer for a random word after you lock, and mix it in, so even you can’t steer the result.</p>

<h2>What if the winner doesn’t reply?</h2>
<p>Decide this before the giveaway and put it in the rules. A common approach is a fixed claim window, from a few minutes on a live stream to a few days for a post. If the winner misses it, draw again. In SpinDraw the claim timer counts down for you, and pressing R logs a no-show and redraws that prize, so the record shows exactly what happened.</p>

<h2>Check the platform’s rules</h2>
<p>Social platforms have their own promotion rules. Meta’s <a href="https://www.facebook.com/policies_center/pages_groups_events" rel="noopener">Pages, Groups and Events policies</a> cover promotions on Facebook, and Instagram has its own <a href="https://help.instagram.com/179379842258600" rel="noopener">promotion guidelines</a>. Read them before you launch, especially if your entry rules involve tagging or sharing. And if entries are tied to buying something, the giveaway may count as a sales promotion where you live, which can need a permit.</p>

<h2>Protect your winner from scammers</h2>
<p>Giveaways attract fake accounts that copy your name and message entrants claiming they’ve won, then ask for a “delivery fee”. Tell your audience up front how you’ll contact the real winner, and that you’ll never ask them to pay anything to claim a prize.</p>`,
    faq: [
      ['What is the fairest way to pick a giveaway winner?', 'Lock the entry list before the draw, draw with a random tool everyone can watch, and share proof afterwards that anyone can check. Asking a viewer for a random word to mix in makes it hard for even the host to steer the result.'],
      ['How do I pick a random winner from comments?', 'Copy the comments, paste them into a comment picker that strips likes and timestamps, filter by your entry keyword and remove duplicates. Then draw from the clean list.'],
      ['Should I let people enter more than once?', 'Only if your rules say so. Most giveaways count one entry per person. If you give bonus entries, announce them in advance and keep them visible.'],
      ['What should I do if the winner never responds?', 'Set a claim window in your rules before the giveaway. If the winner misses it, log them as a no-show and draw again for that prize.'],
    ],
    cta: {
      heading: 'Pick your giveaway winner in front of everyone',
      text: 'Paste your entries, lock the list and draw live. Then share a link that lets anyone check the result.',
      primary: { label: 'Open the name picker', href: '/app.html?mode=wheel' },
      secondary: { label: 'Make it a ball race', href: '/app.html?mode=race' },
    },
  },
  {
    slug: 'fun-ways-to-pick-a-winner',
    title: 'Fun Ways to Pick a Winner: 10 Ideas for Raffles and Parties',
    description: 'Fun ways to pick a winner for raffles, giveaways, classes and parties: a wheel, slot machine, races, pixel battle, bracket and classic offline ideas.',
    h1: 'Fun ways to pick a winner for raffles, classes and parties',
    date: '2026-11-07',
    updated: '2026-11-22',
    cover: '/media/blog/covers/fun-ways-to-pick-a-winner.jpg',
    coverAlt: 'A flat illustration of ways to pick a winner: a prize wheel, marbles rolling down a ramp, a toy racehorse, a pixel knight, dice and a hat full of name slips',
    shot: '/media/blog/fun-ways-to-pick-a-winner.jpg',
    shotAlt: 'Four ways to pick a winner in SpinDraw: a spinning name wheel, a ball race, a horse race and a pixel battle',
    shotCaption: 'Four of the six ways to reveal the same fair draw in SpinDraw: the wheel, Ball Race, Horse Race and Pixel Battle.',
    answer: 'The most fun ways to pick a winner turn the draw into something people watch: a spinning wheel, a slot machine, a race, a last-one-standing battle or a knockout bracket on screen, or classics like names in a hat and raffle tickets. Pick based on your group size, whether you have a screen, and whether people need proof the draw was fair.',
    body: `
<h2>On-screen ways to pick a winner</h2>
<p>These all work on a projector, a TV or a shared screen on a video call. In SpinDraw they all use the same fair draw behind the scenes. The game only changes how the winner is revealed.</p>
<h3>1. Spin the wheel</h3>
<p>The classic. Every name gets a slice, the wheel spins, and the pointer lands on the winner. It’s quick, everyone understands it straight away, and it handles thousands of names. It suits big lists and quick decisions.</p>
<h3>2. Ball race</h3>
<p>Every name becomes a ball that drops through pegs, spinning bars and bumpers, and the first one across the finish line wins. A live board shows who’s leading, so people cheer for their ball the whole way down.</p>
<h3>3. Horse race</h3>
<p>Each person gets a pixel horse and jockey, and the lead changes as they gallop to the finish. It’s a crowd-pleaser at office parties. With the Christmas theme on, the horses turn into reindeer.</p>
<h3>4. Pixel battle</h3>
<p>Names become little pixel fighters who dodge, block and knock each other out while a circle closes in. The last one standing wins. Expect a lot of noise from whoever’s watching.</p>
<h3>5. Slot machine</h3>
<p>Pull the lever and the reels spin. The name reel slows down, creeps past a name or two, and lands on the winner while the sevens line up. It takes a few seconds per pull and handles lists of any size.</p>
<h3>6. Elimination bracket</h3>
<p>Up to 64 names face off one on one, round by round, and the semi-finals and final are fought as full-screen pixel duels. It picks a champion, a runner-up, and third and fourth place, and people root for their name through every round.</p>
<h3>Which on-screen picker should you use?</h3>
<div class="table-scroll"><table class="compare">
  <thead><tr><th>Method</th><th>Best for</th><th>Group size</th><th>How long</th></tr></thead>
  <tbody>
    <tr><td>Spinning wheel</td><td>Quick picks, big lists, classrooms</td><td>Thousands</td><td>A few seconds</td></tr>
    <tr><td>Ball race</td><td>Giveaways and streams</td><td>Up to 100</td><td>About 20 to 60 seconds</td></tr>
    <tr><td>Horse race</td><td>Office parties and events</td><td>Up to 100</td><td>About 20 to 60 seconds</td></tr>
    <tr><td>Pixel battle</td><td>Groups who like chaos</td><td>Up to 100</td><td>About 20 to 60 seconds</td></tr>
    <tr><td>Slot machine</td><td>Big lists with a bit of suspense</td><td>Thousands</td><td>About 4 to 8 seconds a pull</td></tr>
    <tr><td>Elimination bracket</td><td>Teams, classes and game nights</td><td>Up to 64</td><td>About 20 to 60 seconds</td></tr>
  </tbody>
</table></div>
<p>The races, the battle and the slot machine can also pick several winners at once, up to 50, such as the first three across the line or the last five standing. The bracket picks up to four. Each game has its own page where you can play it straight away: the <a href="/ball-race-name-picker/">ball race</a>, the <a href="/horse-race-name-picker/">horse race</a>, the <a href="/battle-royale-name-picker/">battle royale picker</a>, the <a href="/slot-machine-name-picker/">slot machine</a> and the <a href="/random-bracket-generator/">bracket generator</a>.</p>

<h2>Classic offline ways to pick a winner</h2>
<h3>7. Names in a hat</h3>
<p>Write every name on the same size paper, fold them the same way and give the hat a good shake. It’s simple and fun in a room, but it doesn’t work for anyone on a call, and nobody can check it afterwards.</p>
<h3>8. Raffle tickets</h3>
<p>Hand out numbered tickets from a double roll and draw the matching half from a bowl. It’s great for events with walk-in guests. If people pay for tickets, check your local rules first, because paid <a href="https://en.wikipedia.org/wiki/Raffle" rel="noopener">raffles</a> often need a licence.</p>
<h3>9. Playing cards</h3>
<p>For small groups, deal one card each and draw a matching card from a second deck. Whoever holds the match wins.</p>
<h3>10. Dice</h3>
<p>Fine for six people or fewer. Give each person a number and roll. Roll again on a tie.</p>

<h2>How to choose the right method</h2>
<ul>
  <li><strong>Over 100 people?</strong> Use the wheel or the slot machine, which handle lists of any size.</li>
  <li><strong>Remote or hybrid group?</strong> Pick something on screen so everyone sees the same draw.</li>
  <li><strong>Prize worth arguing about?</strong> Choose a method people can check afterwards, not just one they watched.</li>
  <li><strong>Just want a laugh?</strong> Go for a race, a battle or a bracket. Watching a friend’s horse lose the lead never gets old.</li>
</ul>
<p>Whatever you pick, a quiz or a game of skill isn’t a random draw. If the prize should be down to luck, use one of the methods above.</p>`,
    faq: [
      ['What is the most fun way to pick a winner?', 'A draw people can watch build up, like a ball race or horse race where the lead changes, is usually more fun than an instant result. A spinning wheel is the quickest option that still has some suspense.'],
      ['What is the fairest way to pick a winner?', 'Use a random draw that everyone can watch and that can be checked afterwards. Locking the list before the draw and sharing a verify link is fairer than a screenshot, because it shows the result came from the list.'],
      ['How do you pick a winner from a large group?', 'For more than 100 names, use a spinning wheel or a slot machine, which handle thousands of entries. The race and battle games suit groups of up to 100, and the bracket up to 64.'],
      ['Can I pick more than one winner at once?', 'Yes. In SpinDraw’s ball race, horse race, pixel battle and slot machine, you can set how many winners you want, up to 50. The bracket picks up to four.'],
    ],
    cta: {
      heading: 'Try all six ways to pick a winner',
      text: 'Spin the wheel, pull a slot machine, race balls or horses, start a pixel battle or run a bracket. Same fair draw, six ways to reveal it.',
      primary: { label: 'Start a pixel battle', href: '/app.html?mode=battle' },
      secondary: { label: 'Try the horse race', href: '/app.html?mode=horse' },
    },
  },
  {
    slug: 'baby-shower-raffle-ideas',
    title: 'Baby Shower Raffle Ideas: How a Diaper Raffle Works (Plus Prizes)',
    description: 'Baby shower raffle ideas, starting with the diaper raffle: how it works, what to write on the invitation, prize ideas, and how to draw the winners.',
    h1: 'Baby shower raffle ideas, from the diaper raffle to the draw',
    date: '2026-11-07',
    updated: '2026-11-07',
    cover: '/media/blog/covers/baby-shower-raffle-ideas.jpg',
    coverAlt: 'A flat illustration of a baby shower diaper raffle table: stacked diaper packs, a roll of raffle tickets, a bowl of tickets, balloons, a rattle and a gift',
    shot: '/media/blog/baby-shower-raffle.jpg',
    shotAlt: 'A SpinDraw ball race in the pastel Easter theme, with egg-shaped balls labelled with guests’ names and LET’S ROLL on screen',
    shotCaption: 'With the Easter theme on, the Ball Race balls become pastel eggs, a good fit for a baby shower.',
    answer: 'The most popular baby shower raffle is the diaper raffle: guests who bring a pack of diapers get a raffle ticket, and a few names are drawn at the end for small prizes. It helps the parents-to-be stock up and gives guests a reason to stay for the draw.',
    body: `
<h2>How does a diaper raffle work?</h2>
<p>It’s simple. On the invitation, ask guests to bring a pack of diapers if they’d like to enter. When they arrive, they put their name down and get a raffle ticket. Towards the end of the <a href="https://en.wikipedia.org/wiki/Baby_shower" rel="noopener">baby shower</a>, you draw one or more winners for small prizes. The parents-to-be go home with a stack of diapers, and nobody minds, because babies get through a lot of them.</p>
<p>A few details make it run smoothly:</p>
<ul>
  <li><strong>Suggest a mix of sizes.</strong> Newborn sizes are outgrown fast, so bigger sizes are often more useful.</li>
  <li><strong>Decide on extra entries in advance.</strong> For example, one entry per pack. Write it on the invitation so it’s clear.</li>
  <li><strong>Keep it optional.</strong> Make sure nobody feels they have to buy their way into the fun.</li>
</ul>

<h2>What to write on the invitation</h2>
<p>Short and friendly works best. A few lines you could adapt:</p>
<ul>
  <li>“Bring a pack of diapers in any size and we’ll enter you in our diaper raffle!”</li>
  <li>“Want to win a prize? Bring a pack of diapers and get a raffle ticket at the door.”</li>
  <li>“One pack of diapers, one raffle ticket. Bigger sizes are very welcome!”</li>
</ul>

<h2>Baby shower raffle prize ideas</h2>
<p>The prizes are for guests, not the baby, so think small treats:</p>
<ul>
  <li>A coffee shop or bakery gift card</li>
  <li>A scented candle or a small plant</li>
  <li>A bottle of wine, or a nice sparkling juice</li>
  <li>A pamper kit with a face mask and hand cream</li>
  <li>Chocolates or a box of local treats</li>
  <li>A cinema voucher</li>
</ul>
<p>Two or three prizes is plenty for most showers. Draw the smaller ones first and save the best for last.</p>

<h2>Other baby shower raffle ideas</h2>
<ul>
  <li><strong>Wipes raffle.</strong> The same idea, with packs of wipes instead of diapers.</li>
  <li><strong>Book raffle.</strong> Guests bring a children’s book instead of a card, signed inside, and get a ticket. The baby gets a whole library.</li>
  <li><strong>Game winners’ draw.</strong> Everyone who wins a shower game gets a raffle entry for one bigger prize at the end.</li>
</ul>

<h2>How to draw the winners</h2>
<p>Paper tickets in a bowl work fine. If you want a bit more of a moment, or some guests are joining online, put the draw on a screen. In SpinDraw, type each guest’s name, add x2 after the name of anyone who brought two packs so they get two entries, and draw. Turn on the Easter theme and the balls in the ball race become pastel eggs, which suits a shower nicely. Guests joining by video can watch the same draw on a screen share.</p>
<p>If you’re drawing several prizes, keep winners from winning twice by removing them after each prize. That way, more guests go home with something.</p>`,
    faq: [
      ['What is a diaper raffle at a baby shower?', 'Guests who bring a pack of diapers get a raffle ticket. At the end of the shower, one or more names are drawn for small prizes, and the parents-to-be keep all the diapers.'],
      ['How many diapers should each guest bring for a diaper raffle?', 'One pack is the usual ask. Some hosts give an extra raffle entry for each additional pack, which they mention on the invitation.'],
      ['What prizes do you give for a baby shower raffle?', 'Small treats for the guests, like a coffee gift card, a candle, chocolates or a pamper kit. Two or three prizes is enough for most showers.'],
      ['Can you do a diaper raffle at a virtual baby shower?', 'Yes. Guests send diapers to the parents directly or order them online, then you draw the winners live on a screen share during the call.'],
    ],
    cta: {
      heading: 'Draw your baby shower raffle winners',
      text: 'Type your guests’ names, give extra entries for extra packs, and race pastel eggs to find the winners. Free, and no sign-up.',
      primary: { label: 'Start a pastel egg race', href: '/app.html?mode=race&theme=easter' },
      secondary: { label: 'Spin the wheel instead', href: '/app.html?mode=wheel' },
    },
  },
];
