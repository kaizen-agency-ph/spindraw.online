// Blog posts. Each one becomes /blog/<slug>/, appears on /blog/, in the RSS feed, in the sitemap
// and on the home page. To add a post, add an object here (newest first) and run
// `node scripts/build-pages.mjs`. Facts about SpinDraw must match what the app really does.

export const AUTHOR = { name: 'Vincent Carl Benlot', url: '/about/' };

export const POSTS = [
  {
    slug: 'office-christmas-raffle-ideas',
    title: 'Office Christmas Raffle Ideas: Prizes, Formats and a Fair Draw',
    description: 'Office Christmas raffle ideas that work: prize ideas at every budget, five ways to run the draw, and how to keep it fair for remote and hybrid teams.',
    h1: 'Office Christmas raffle ideas people actually look forward to',
    date: '2026-11-07',
    updated: '2026-11-07',
    image: '/media/blog/office-christmas-raffle.jpg',
    imageAlt: 'A Christmas-themed horse race in SpinDraw: reindeer with antlers and Santa-capped riders racing on a snowy track, with a live leaderboard',
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
    image: '/media/blog/secret-santa-rules.jpg',
    imageAlt: 'A Christmas-themed pixel battle in SpinDraw: fighters in Santa hats, elf hats and antlers on a snowy arena with pine trees',
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
    image: '/media/blog/random-giveaway-winner.jpg',
    imageAlt: 'The SpinDraw name picker wheel with eight names on coloured slices, ready to spin',
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
    title: 'Fun Ways to Pick a Winner: 8 Ideas for Raffles and Parties',
    description: 'Fun ways to pick a winner for raffles, giveaways, classes and parties: a spinning wheel, ball race, horse race, pixel battle and classic offline ideas.',
    h1: 'Fun ways to pick a winner for raffles, classes and parties',
    date: '2026-11-07',
    updated: '2026-11-07',
    image: '/media/blog/fun-ways-to-pick-a-winner.jpg',
    imageAlt: 'Four ways to pick a winner in SpinDraw: a spinning name wheel, a ball race, a horse race and a pixel battle',
    answer: 'The most fun ways to pick a winner turn the draw into something people watch: a spinning wheel, a ball race, a horse race or a last-one-standing battle on screen, or classics like names in a hat and raffle tickets. Pick based on your group size, whether you have a screen, and whether people need proof the draw was fair.',
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
<h3>Which on-screen picker should you use?</h3>
<div class="table-scroll"><table class="compare">
  <thead><tr><th>Method</th><th>Best for</th><th>Group size</th><th>How long</th></tr></thead>
  <tbody>
    <tr><td>Spinning wheel</td><td>Quick picks, big lists, classrooms</td><td>Thousands</td><td>A few seconds</td></tr>
    <tr><td>Ball race</td><td>Giveaways and streams</td><td>Up to 100</td><td>About 20 to 60 seconds</td></tr>
    <tr><td>Horse race</td><td>Office parties and events</td><td>Up to 100</td><td>About 20 to 60 seconds</td></tr>
    <tr><td>Pixel battle</td><td>Groups who like chaos</td><td>Up to 100</td><td>About 20 to 60 seconds</td></tr>
  </tbody>
</table></div>
<p>The three games can also pick several winners at once, up to 50, such as the first three across the line or the last five standing. You can read more about each in our guides to the <a href="/ball-race-name-picker/">ball race</a>, the <a href="/horse-race-name-picker/">horse race</a> and the <a href="/battle-royale-name-picker/">battle royale picker</a>.</p>

<h2>Classic offline ways to pick a winner</h2>
<h3>5. Names in a hat</h3>
<p>Write every name on the same size paper, fold them the same way and give the hat a good shake. It’s simple and fun in a room, but it doesn’t work for anyone on a call, and nobody can check it afterwards.</p>
<h3>6. Raffle tickets</h3>
<p>Hand out numbered tickets from a double roll and draw the matching half from a bowl. It’s great for events with walk-in guests. If people pay for tickets, check your local rules first, because paid <a href="https://en.wikipedia.org/wiki/Raffle" rel="noopener">raffles</a> often need a licence.</p>
<h3>7. Playing cards</h3>
<p>For small groups, deal one card each and draw a matching card from a second deck. Whoever holds the match wins.</p>
<h3>8. Dice</h3>
<p>Fine for six people or fewer. Give each person a number and roll. Roll again on a tie.</p>

<h2>How to choose the right method</h2>
<ul>
  <li><strong>Over 100 people?</strong> Use the wheel, which handles lists of any size.</li>
  <li><strong>Remote or hybrid group?</strong> Pick something on screen so everyone sees the same draw.</li>
  <li><strong>Prize worth arguing about?</strong> Choose a method people can check afterwards, not just one they watched.</li>
  <li><strong>Just want a laugh?</strong> Go for a race or a battle. Watching a friend’s horse lose the lead never gets old.</li>
</ul>
<p>Whatever you pick, a quiz or a game of skill isn’t a random draw. If the prize should be down to luck, use one of the methods above.</p>`,
    faq: [
      ['What is the most fun way to pick a winner?', 'A draw people can watch build up, like a ball race or horse race where the lead changes, is usually more fun than an instant result. A spinning wheel is the quickest option that still has some suspense.'],
      ['What is the fairest way to pick a winner?', 'Use a random draw that everyone can watch and that can be checked afterwards. Locking the list before the draw and sharing a verify link is fairer than a screenshot, because it shows the result came from the list.'],
      ['How do you pick a winner from a large group?', 'For more than 100 names, use a spinning wheel, which handles thousands of entries. The race and battle games suit groups of up to 100.'],
      ['Can I pick more than one winner at once?', 'Yes. In SpinDraw’s ball race, horse race and pixel battle, you can set how many winners you want, up to 50.'],
    ],
    cta: {
      heading: 'Try all four ways to pick a winner',
      text: 'Spin the wheel, race balls or horses, or start a pixel battle. Same fair draw, four ways to reveal it.',
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
    image: '/media/blog/baby-shower-raffle.jpg',
    imageAlt: 'A SpinDraw ball race in the pastel Easter theme, with egg-shaped balls labelled with guests’ names and LET’S ROLL on screen',
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
