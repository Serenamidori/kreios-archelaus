var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json'); // Configure logger settings 
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, { colorize: true });
logger.level = 'debug'; // Initialize Discord Bot
var bot = new Discord.Client({ 
	token: auth.token,
	autorun: true 
});
bot.on('ready', function (evt) { 
	console.log('[' + bot.username + ' is now online]'); 
});

// String Arrays
var responses = [
	["Oh fuck, that's a ", "_Eeeesh_, it's a "], // 0-9%
	["Good luck with a ", "Oh well, can't do much with a ", "Oof, that's a "], // 10-25%	
	["You get a ", "It's a ", "I bestow you a "], // 26-74%
	["Not bad, you got a ", "Oh wow, that's a ", "Nice, it's a "], // 75-90%
	["_Yoooo_, it's a ", "Oh damn, you got a "], // 91-100%
	["Critical fail, you rolled a natural 1 there buddy. Your total is "], // crit fail
	["Critical Success! You rolled a natural 20! Your total is "], // crit success
	["Incredible, a natural 20 _and_ natural 1? Hope you were rolling with advantage, buddy! Your total is "], // both crits
];

// Intervention table
var interventions = ["New Entity","Entity Positive","Entity Negative","Advance Plot","Regress Plot","Wild"];

// Oracle table
var oracle = ["No, and...", "No.", "No, but...", "Yes, but...", "Yes.", "Yes, and..."];

// TWENE table
var twene = ["Let's increase a simple element.", "Let's decrease a simple element.", "Let's add a simple element.", "Let's remove a simple element.", "Let's increase a major element.", "Let's decrease a major element.", "Let's add a major element.", "Let's remove a major element.", "Let's try a wild positive!", "Let's try a wild negative!"];

// NPC Attitude table
var npcAttitude = ["They are hostile towards you.", "They are neutral towards you.", "They are friendly towards you."];

// NPC Build table
// [0] Races (common), [1] Races (uncommon), [2] Races (monster), [3] Classes, [4] Genders, [5] Color, [6] Hair length, [7] Height, [8] Weight, [9] Misc.
var npcBuild = [
	["human", "elf", "dwarf", "half-elf", "gnome", "halfling", "drow"],
	["half-orc", "tiefling", "dragonborn", "kenku", "aasimar", "aarakocra", "lizardfolk", "tabaxi", "triton", "firbolg", "centaur", "satyr"],
	["goblin", "hobgoblin", "bugbear", "kobold", "yuan-ti"],
	["wizard", "fighter", "sorcerer", "warlock", "paladin", "cleric", "barbarian", "bard", "artificer", "ranger", "druid", "monk", "rogue"],
	["male", "female", "nonbinary"],
	["black", "white", "brown", "orange", "red", "pink", "blue", "purple", "green", "yellow"],
	["short hair", "long hair", "medium hair"],
	["short", "tall", "average"],
	["heavy", "thin", "average"],
	["freckles", "scar", "beauty mark", "missing eye/limb", "facial hair", "glasses"]
];

// Intervention point tracker
var interventionPoints = 0;

// Generates a random number, default 1-20
function rand (sides) {
	if (sides) {
		return Math.ceil(Math.random() * sides);	
	} else {
		return Math.ceil(Math.random() * 20);
	}
};

// Formats the messages for the dice roller
function diceMessage (index, bonus, symbol, count, numbers, sides, total) {
	var response = responses[index];
	var punctuation = index == 4 ? "!" : ".";

	var bonusMessage = bonus && symbol ? symbol + bonus : "";
	var bonusRoll = bonus && symbol ? " (" + symbol + " " + bonus + ")" : "";

	var rolls = "";
	for (i = 0; i < count; i++) {
		rolls += numbers[i];
		if (i != count - 1) {
			rolls += " + "
		}
	}
	var diceMessage = " `[" + count + "d" + sides + bonusMessage + "] = (" + rolls + bonusRoll + ")`"
	return response[rand(response.length)-1] + total + punctuation + "\n" + diceMessage;
}

// Formats a message to @ the user who sent the command
function atUser (userId) {
	return '<@' + userId + '> ';
}

// Checks if a string appears in an array
function contains (array, string) {
	for (i = 0; i < array.length; i++) {
		if (array[i] == string) {
			return true;
		}
	}
	return false;
}

// Adds an intervention point to the score and handles when we reach 3
function addInterventionPoint (channelId) {
	interventionPoints++;
	if (interventionPoints >= 3) {
		bot.sendMessage({ to: channelId, message: '**Intervention:** ' + interventions[rand(6)-1]});
		interventionPoints = 0;
	}
}

bot.on('message', function (user, userId, channelId, message, evt) { 
	
	// Prevents Kreios from responding to his own messages
	if (userId == bot.id) return;

	// heh, nice
	if (message.toLowerCase().includes('69') && !message.toLowerCase().includes('<@')) { bot.sendMessage({ to: channelId, message: atUser(userId) + 'Heh, _nice_.' }); }
		
	// commands
	if (message.substring(0, 1) == '!' || message.substring(0, 1) == '/') {
		message = message.toLowerCase();
		var parser = message.substring(0, 1);
		var args = message.substring(1).split(/ +/);
		var cmd = args[0]; 
		args = args.splice(1);
		//console.log(cmd);
		//console.log(args);

		switch(cmd) {
			case '':
				if (args.length != 0) {
					bot.sendMessage({ to: channelId, message: atUser(userId) + 'Sorry, didn\'t quite get that. Make sure not to add a space between the "' + parser + '" and your command.' }); 
				}
				break;
			case 'npc':
			case 'n':
				if (args.length == 0) {
					bot.sendMessage({ to: channelId, message: atUser(userId) + 'Please specify what you\'d like to know about this NPC.\n**attitude (a)** - Gives the demeanor of the NPC towards you.\n**build (b)** - Creates a random NPC description to work with.' }); 
				}
				// build
				if (contains(args, 'build') || contains(args, 'b')) {
					var npc = "**New NPC**";
					
					var raceArray = npcBuild[0];
					if (contains(args, 'uncommon') || contains(args, 'u')) {
						raceArray = raceArray.concat(npcBuild[1]);
					} if (contains(args, 'rare') || contains(args, 'r')) {
						raceArray = raceArray.concat(npcBuild[2]);
					} if (contains(args, 'monster') || contains(args, 'm')) {
						raceArray = npcBuild[2];
					}
					npc += "\nRace: " + raceArray[rand(raceArray.length)-1];

					if (contains(args, 'class') || contains(args, 'c')) {
						npc += "\nClass: " + npcBuild[3][rand(npcBuild[3].length)-1];
					}  
					//check for other args, otherwise default to only Race, Gender, Eye Color, Hair Color and Length, Height, Weight, and 1 Misc.
					npc += "\nGender: " + npcBuild[4][rand(npcBuild[4].length)-1] + 
						"\nHair Color: " + npcBuild[5][rand(npcBuild[5].length)-1] + 
						"\nHair Length: " + npcBuild[6][rand(npcBuild[6].length)-1] + 
						"\nEye Color: " + npcBuild[5][rand(npcBuild[5].length)-1] + 
						"\nHeight: " + npcBuild[7][rand(npcBuild[7].length)-1] + 
						"\nWeight: " + npcBuild[8][rand(npcBuild[8].length)-1] + 
						"\nMisc. Trait: " + npcBuild[9][rand(npcBuild[9].length)-1];

					// TODO: Make this a helper method instead, and take in multiple arguments without issue
					bot.sendMessage({ to: channelId, message: npc});
				}
				// attitude
				if (contains(args, 'attitude') || contains(args, 'a')) {
					bot.sendMessage({ to: channelId, message: atUser(userId) + npcAttitude[rand(3)-1]});
				}
				break;
			case 'oracle':
			case 'o':
				var ips = 0;
				var roll = rand(6);
				if (roll == 6) {
					ips++;
				}
				// likeliness/unlikeliness
				var advantage = contains(args, 'likely') || contains(args, 'l');
				var disadvantage = contains(args, 'unlikely') || contains(args, 'u');
				if (advantage && disadvantage) {
					bot.sendMessage({ to: channelId, message: atUser(userId) + 'You can\'t roll both advantage _and_ disadvantage, silly. Pick one and try again.' });
					break;
				} else if (advantage || disadvantage) {
					var roll2 = rand(6);
					if (roll2 == 6) {
						ips++;
					}
					if (advantage) {
						roll = Math.max(roll, roll2);
					} else {
						roll = Math.min(roll, roll2);
					}
				}
				bot.sendMessage({ to: channelId, message: atUser(userId) + oracle[roll-1] });
				// handle intervention points after all rolls
				for (i = 0; i < ips; i++) {
					addInterventionPoint(channelId);
				}
				break;
			case 'portent':
			case 'p':
				var responses = [
					"Use these words for inspiration", "Here, try these words", "Let these jog your imagination", "Look, I'm not a dictionary, but I know some helpful words"
				];
				var index1 = rand(3)-1;
				var index2 = rand(3)-1;
				var word1 = portents[index1][rand(portents[index1].length)-1];
				var word2 = portents[index2][rand(portents[index2].length)-1];

				bot.sendMessage({ to: channelId, message: atUser(userId) + responses[rand(responses.length-1)] + ': "' + word1 + '" and "' + word2 + '"'});
				break;
			case 'twene':
			case 't':
				bot.sendMessage({ to: channelId, message: atUser(userId) + 'Ah, so things are not as expected? ' + twene[rand(twene.length-1)]});
				break;
			case 'flip':
			case 'f':
				var coin = rand(2) == 2 ? "heads" : "tails";
				bot.sendMessage({ to: channelId, message: atUser(userId) + 'I flipped a coin for you, it was ' + coin + '.' });
				break;
			case 'roll':
			case 'r':
				if (parser != "!") { // quick fix for Avrae
					// set defaults
					var numbers = [];
					var total = 0;
					var count = 1;
					var sides = 20;
					var symbol;
					var bonus;
					var critSuccess = false;
					var critFail = false;
					// set up dice
					var dice = message.match(/(\d*)\s*[d|D]\s*(\d+)(\s*([\+|\-])\s*(\d+)+)*/);
					if (dice) {
						count = dice[1] ? dice[1] : count;
						sides = dice[2];
						symbol = dice[4];
						bonus = dice[5];
					}
					// handle d0 dice
					if (sides == 0) {
						bot.sendMessage({ to: channelId, message: atUser(userId) + 'Look- it\'s fucking nothing!' }); 
						return;
					}
					// roll all dice
					for (i = 0; i < count; i++) {
						numbers[i] = rand(sides);
						total += numbers[i];
						// account for crits
						critSuccess = critSuccess || numbers[i] == sides;
						critFail = critFail || numbers[i] == 1;
					}
					// apply bonuses
					if (symbol) {
						if (symbol == "+") {
							total += parseInt(bonus);
						} else {
							total -= parseInt(bonus);
						}
					}				
					// calculate percentage of success
					var max = sides * count;
					var index = 2; // default, 26-74%
					if (critSuccess && critFail) { // both crit success and crit fail
						index = 7;
					} else if (critSuccess && sides == 20) { // crit success
						index = 6;
					} else if (critFail && sides == 20) { // crit fail
						index = 5;
					} else if (total >= max * .90) { // 91-100%
						index = 4;
					} else if (total <= max * .10) { // 0-9%
						index = 0;	
					} else if (total >= max * .75) { // 75-90%
						index = 3;
					} else if (total <= max * .25) { // 10-25%	
						index = 1;
					}
					bot.sendMessage({ to: channelId, message: atUser(userId) + diceMessage(index, bonus, symbol, count, numbers, sides, total) });
					// handle nice
					if (total == 69) {
						bot.sendMessage({ to: channelId, message: 'Heh, _nice_.' }); 
					}
				}
				break;
			case 'help':
			case 'h':
				bot.sendMessage({ to: channelId, message: 'I will list the commands I understand. Be sure to use `!` or `/` before a command without spaces, unless otherwise stated:\n\n**roll (r)** - Dice roller in xdy format. [Be sure to only use `/` for this command, Avrae uses `!` for roll instead. Either dice is acceptable for gameplay]\n**flip (f)** - Coin flipper, I\'ll take a coin from my hoard and flip it for you.\n**oracle (o)** - The Oracle system. Ask a yes/no question with this command and I\'ll give you the answer.\n**npc (n)** - NPC options, attitude to see how NPCs react to you and build to create random descriptions.\n**portent (p)** - Portents, you receive two random words to help with inspiration.\n**twene (t)** - Table for When Everything is Not as Expected, use this when something in the scene is unusual, and go from there.\n**intro (i)** - A short description of myself and what I do.\n**credits (c)** - Credits to artists and systems that I use.\n**help (h)** - _This~_\n\nIf you address me by name, DM or Dungeon Master, Ill come to your beck and call. ~~Not that I have much of a choice.~~' }); 
				break; 
			case 'intro':
			case 'i':
				bot.sendMessage({ to: channelId, message: 'I am Kreios Archelaus, your new Dungeon Master. I may not be as talkative or descriptive as your _normal_ DM, but I will help to shape your world.\n\nMy purpose is to answer your questions as you play through campaigns by yourself or with a party. You will be the one(s) building your world, I\'m simply here to tell you \'yes\' or \'no\'. Out of the two of us, you\'ve got the most creativity here.\nI work on a system called MUNE (The Madey Upy Namey Emulator), where we work on Second Hand Creativity. If you need more information, you can read about it here: https://homebrewery.naturalcrit.com/share/rkmo0t9k4Q \nI have a few commands that start with `!` and `/`, you can read about them with `!help` or `/help`. But you may also talk to me normally, and I\'ll respond when I see something I can respond to.' }); 
				break; 
			case 'credits':
			case 'c':
				bot.sendMessage({ to: channelId, message: 'Coding by SerenaMidori [https://twitter.com/SerenaMidori]\nCharacter Design by Cassivel [https://www.deviantart.com/cassivel] \nMUNE System by /u/bionicle_fanatic [https://homebrewery.naturalcrit.com/share/rkmo0t9k4Q]\nPortent Words from [https://wordcounter.net/random-word-generator]' }); 
				break; 
		} 
	} 
	//addressing the DM
	else if (message.toLowerCase().includes('dm') || message.toLowerCase().includes('dungeon master') || message.toLowerCase().includes('kreios') || message.toLowerCase().includes('archelaus') || message.toLowerCase().includes(bot.id)) { 
		// calling him daddy
		if (message.toLowerCase().includes('daddy')) {
			var responses = [
				"**No.** None of that.", "*Absolutely not*."
			];
			bot.sendMessage({ to: channelId, message: responses[rand(responses.length - 1)] });
			return;
		}
		// calling him cute
		if (message.toLowerCase().includes('cute') || message.toLowerCase().includes('adorable') || message.toLowerCase().includes('kawaii')) {
			var responses = [
				"Aww~ you flatter me.", "You're making me blush~."
			];
			bot.sendMessage({ to: channelId, message: responses[rand(responses.length - 1)] });
			return;
		}
		// fight me
		if (message.toLowerCase().includes('fight me')) {
			var responses = [
				"Okay, I use Sacred DM Dragon's Flame. It instantly takes out all your remaining HP and kills you super dead. Want to try that again?", "Meet me in the Denny's parking lot.", "You _really_ want to fight the Dungeon Master? _Pff_."
			];
			bot.sendMessage({ to: channelId, message: responses[rand(responses.length - 1)] });
			return;
		}
		// fuck you
		if (message.toLowerCase().includes('fuck you') || message.toLowerCase().includes('fuck off')) {
			var responses = [
				"_Language._ You kiss your mother with that mouth?", "Is that an invitation? ...oh, no that's you trying to be clever.", "No thanks~", "You roll a natural 1 and die, roll a new character."
			];
			bot.sendMessage({ to: channelId, message: responses[rand(responses.length - 1)] });
			return;
		}
		// thank you
		if (message.toLowerCase().includes('thank you') || message.toLowerCase().includes('thank') || message.toLowerCase().includes('thanks')) {
			var responses = [
				"You're most welcome.", "But of course.", "Mhm... what did I do?"
			];
			bot.sendMessage({ to: channelId, message: responses[rand(responses.length - 1)] });
			return;
		}
		//default responses
		var responses = [
			"Yes?", "What do you want?", "May I help you?", "Yes, I was paying attention, what?", "_Mmmyes?_"
		];
		bot.sendMessage({ to: channelId, message: responses[rand(responses.length - 1)] });
	} 
}); 


// Portent word arrays (https://wordcounter.net/random-word-generator)
// verbs [0], nouns [1], adjectives [2]
var portents = [['abandon','abash','abate','abide','absorb','accept','accompany','ache','achieve','acquire','act','add','address','adjust','admire','admit','advise','afford','agree','alight','allow','animate','announce','answer','apologize','appear','applaud','apply','approach','approve','argue','arise','arrange','arrest','ask','assert','assort','astonish','attack','atten','attract','audit','avoid','awake','bang','banish','bash','bat','be','bear','beat','beautify','become','befall','beg','begin','behave','behold','believe','belong','bend','bereave','beseech','bet','betray','bid','bind','bite','bleed','bless','blossom','blow','blur','blush','board','boast','boil','bow','box','bray','break','breathe','breed','bring','broadcast','brush','build','burn','burst','bury','bust','buy','buzz','calculate','call','canvass','capture','caress','carry','carve','cash','cast','catch','cause','cease','celebrate','challenge','change','charge','chase','chat','check','cheer','chew','chide','chip','choke','choose','classify','clean','cleave','click','climb','cling','close','clothe','clutch','collapse','collect','colour','come','comment','compare','compel','compete','complain','complete','conclude','conduct','confess','confine','confiscate','confuse','congratulate','connect','connote','conquer','consecrat','consen','conserve','consider','consign','consist','console','consort','conspire','constitute','constrain','construct','construe','consult','contain','contemn','contend','contest','continue','contract','contradict','contrast','contribute','contrive','control','convene','converge','convers','convert','convey','convict','convince','coo','cook','cool','co-operate','cope','copy','correct','correspon','corrod','corrupt','cost','cough','counsel','count','course','cover','cower','crack','crackle','crash','crashed','crashed','crashes','crashing','crave','create','creep','crib','cross','crowd','crush','cry','curb','cure','curve','cut','cycle','damage','damp','dance','dare','dash','dazzle','deal','decay','decide','declare','decorate','decrease','dedicate','delay','delete','deny','depend','deprive','derive','describe','desire','destroy','detach','detect','determine','develop','die','differ','dig','digest','dim','diminish','dine','dip','direct','disappear','discover','discuss','disobey','display','dispose','distribute','disturb','disuse','dive','divide','do','donate','download','drag','draw','dream','dress','drill','drink','drive','drop','dry','dump','dwell','dye','earn','eat','educat','empower','empty','encircle','encourage','encroach','endanger','endorse','endure','engrave','enjoy','enlarge','enlighten','enter','envy','erase','escape','evaporate','exchange','exclaim','exclude','exist','expand','expect','explain','explore','express','extend','eye','face','fail','faint','fall','fan','fancy','favour','fax','feed','feel','ferry','fetch','fight','fill','find','finish','fish','fit','fix','fizz','flap','flash','flee','fling','float','flop','fly','fold','follow','forbid','force','forecast','foretell','forget','forgive','forlese','form','forsake','found','frame','free','freeze','frighten','fry','fulfil','gag','gain','gainsay','gash','gaze','get','give','glance','glitter','glow','go','google','govern','grab','grade','grant','greet','grind','grip','grow','guard','guess','guide','handle','hang','happen','harm','hatch','hate','have','heal','hear','heave','help','hew','hide','hinder','hiss','hit','hoax','hold','hop','hope','horrify','hug','hum','humiliate','hunt','hurl','hurry','hurt','hush','hustle','hypnotize','idealize','identify','idolize','ignite','ignore','ill-treat','illuminate','illumine','illustrate','imagine','imbibe','imitate','immerse','immolate','immure','impair','impart','impeach','impede','impel','impend','imperil','impinge','implant','implicate','implode','implore','imply','import','impose','impress','imprint','imprison','improve','inaugurate','incise','include','increase','inculcate','indent','indicate','induce','indulge','infect','infest','inflame','inflate','inflect','inform','infringe','infuse','ingest','inhabit','inhale','inherit','initiate','inject','injure','inlay','innovate','input','inquire','inscribe','insert','inspect','inspire','install','insult','insure','integrate','introduce','invent','invite','join','jump','justify','keep','kick','kid','kill','kiss','kneel','knit','knock','know','lade','land','last','latch','laugh','lay','lead','leak','lean','leap','learn','leave','leer','lend','let','lick','lie','lift','light','like','limp','listen','live','look','lose','love','magnify','maintain','make','manage','march','mark','marry','mash','match','matter','mean','measure','meet','melt','merge','mew','migrate','milk','mind','mislead','miss','mistake','misuse','mix','moan','modify','moo','motivate','mould','moult','move','mow','multiply','murmur','nail','nap','need','neglect','nip','nod','note','notice','notify','nourish','nurse','obey','oblige','observe','obstruct','obtain','occupy','occur','offer','offset','omit','ooze','open','operate','opine','oppress','opt','optimize','orde','organize','originate','output','overflow','overtake','owe','own','pacify','paint','pardon','part','partake','participate','pass','paste','pat','patch','pause','pay','peep','perish','permit','persuade','phone','place','plan','play','plead','please','plod','plot','pluck','ply','point','polish','pollute','ponder','pour','pout','practise','praise','pray','preach','prefer','prepare','prescribe','present','preserve','preset','preside','press','pretend','prevent','print','proceed','produce','progress','prohibit','promise','propose','prosecute','protect','prove','provide','pull','punish','purify','push','put','qualify','quarrel','question','quit','race','rain','rattle','reach','read','realize','rebuild','recall','recast','receive','recite','recognize','recollect','recur','redo','reduce','refer','reflect','refuse','regard','regret','relate','relax','rely','remain','remake','remove','rend','renew','renounce','repair','repeat','replace','reply','report','request','resell','resemble','reset','resist','resolve','respect','rest','restrain','retain','retch','retire','return','reuse','review','rewind','rid','ride','ring','rise','roar','rob','roll','rot','rub','rule','run','rush','sabotage','sack','sacrifice','sadden','saddle','sag','sail','sally','salute','salvage','salve','sample','sanctify','sanction','sap','saponify','sash','sashay','sass','sate','satiate','satirise','satisfy','saturate','saunter','save','savor','savvy','saw','say','scab','scabble','scald','scale','scam','scan','scant','scar','scare','scarify','scarp','scat','scatter','scold','scorch','scowl','scrawl','scream','screw','scrub','search','seat','secure','see','seek','seem','seize','select','sell','send','sentence','separate','set','sever','sew','shake','shape','share','shatter','shave','shear','shed','shine','shirk','shit','shiver','shock','shoe','shoot','shorten','shout','show','shrink','shun','shut','sight','signal','signify','sing','sink','sip','sit','ski','skid','slam','slay','sleep','slide','slim','sling','slink','slip','slit','smash','smell','smile','smite','smooth','smother','snap','snatch','sneak','sneeze','sniff','soar','sob','solicit','solve','soothe','sort','sow','sparkle','speak','speed','spell','spend','spill','spin','spit','split',' spoil','spray','spread','spring','sprout','squeeze','stand','stare','start','state','stay','steal','steep','stem','step','sterilize','stick','stimulate','sting','stink','stir','stitch','stoop','stop','store','strain','stray','stress','stretch','strew','stride','strike','string','strive','study','submit','subscribe','subtract','succeed','suck','suffer','suggest','summon','supply','support','suppose','surge','surmise','surpass','surround','survey','survive','swallow','sway','swear','sweat','sweep','swell','swim','swing','swot','take','talk','tap','taste','tax','teach','tear','tee','tell','tempt','tend','terminate','terrify','test','thank','think','thrive','throw','thrust','thump','tie','tire','toss','touch','train','trampl','transfer','transform','translate','trap','travel','tread','treasure','treat','tree','tremble','triumph','trust','try','turn','type','typeset','understand','undo','uproot','upset','urge','use','utter','value','vanish','vary','verify','vex','vie','view','violate','vomit','wake','walk','wander','want','warn','waste','watch','water','wave','wax','waylay','wear','weave','wed','weep','weigh','welcome','wet','whip','whisper','win','wind','wish','withdraw','work','worry','worship','wring','write','yawn','yell','yield','zinc','zoom'], 
['account','achiever','acoustics','act','action','activity','actor','addition','adjustment','advertisement','advice','aftermath','afternoon','afterthought','agreement','air','airplane','airport','alarm','amount','amusement','anger','angle','animal','answer','ant','ants','apparatus','apparel','apple','apples','appliance','approval','arch','argument','arithmetic','arm','army','art','attack','attempt','attention','attraction','aunt','authority','babies','baby','back','badge','bag','bait','balance','ball','balloon','balls','banana','band','base','baseball','basin','basket','basketball','bat','bath','battle','bead','beam','bean','bear','bears','beast','bed','bedroom','beds','bee','beef','beetle','beggar','beginner','behavior','belief','believe','bell','bells','berry','bike','bikes','bird','birds','birth','birthday','bit','bite','blade','blood','blow','board','boat','boats','body','bomb','bone','book','books','boot','border','bottle','boundary','box','boy','boys','brain','brake','branch','brass','bread','breakfast','breath','brick','bridge','brother','brothers','brush','bubble','bucket','building','bulb','bun','burn','burst','bushes','business','butter','button','cabbage','cable','cactus','cake','cakes','calculator','calendar','camera','camp','can','cannon','canvas','cap','caption','car','card','care','carpenter','carriage','cars','cart','cast','cat','cats','cattle','cause','cave','celery','cellar','cemetery','cent','chain','chair','chairs','chalk','chance','change','channel','cheese','cherries','cherry','chess','chicken','chickens','children','chin','church','circle','clam','class','clock','clocks','cloth','cloud','clouds','clover','club','coach','coal','coast','coat','cobweb','coil','collar','color','comb','comfort','committee','company','comparison','competition','condition','connection','control','cook','copper','copy','cord','cork','corn','cough','country','cover','cow','cows','crack','cracker','crate','crayon','cream','creator','creature','credit','crib','crime','crook','crow','crowd','crown','crush','cry','cub','cup','current','curtain','curve','cushion','dad','daughter','day','death','debt','decision','deer','degree','design','desire','desk','destruction','detail','development','digestion','dime','dinner','dinosaurs','direction','dirt','discovery','discussion','disease','disgust','distance','distribution','division','dock','doctor','dog','dogs','doll','dolls','donkey','door','downtown','drain','drawer','dress','drink','driving','drop','drug','drum','ducks','dust','ear','earth','earthquake','edge','education','effect','egg','eggnog','eggs','elbow','end','engine','error','event','example','exchange','existence','expansion','experience','expert','eye','eyes','face','fact','fairies','fall','family','fan','fang','farm','farmer','father','father','faucet','fear','feast','feather','feeling','feet','fiction','field','fifth','fight','finger','finger','fire','fireman','fish','flag','flame','flavor','flesh','flight','flock','floor','flower','flowers','fly','fog','fold','food','foot','force','fork','form','fowl','frame','friction','friend','friends','frog','frogs','front','fruit','furniture','alley','game','garden','gate','geese','ghost','giants','giraffe','girl','girls','glass','glove','glue','goat','gold','goldfish','good-bye','goose','government','governor','grade','grain','grandfather','grandmother','grape','grass','grip','ground','group','growth','guide','guitar','gun','hair','haircut','hall','hammer','hand','hands','harbor','harmony','hat','hate','head','health','hearing','heart','heat','help','hen','hill','history','hobbies','hole','holiday','home','honey','hook','hope','horn','horse','horses','hose','hospital','hot','hour','house','houses','humor','hydrant','ice','icicle','idea','impulse','income','increase','industry','ink','insect','instrument','insurance','interest','invention','iron','island','jail','jam','jar','jeans','jelly','jellyfish','jewel','join','joke','journey','judge','juice','jump','K','','kettle','key','kick','kiss','kite','kitten','kittens','kitty','knee','knife','knot','knowledge','laborer','lace','ladybug','lake','lamp','land','language','laugh','lawyer','lead','leaf','learning','leather','leg','legs','letter','letters','lettuce','level','library','lift','light','limit','line','linen','lip','liquid','list','lizards','loaf','lock','locket','look','loss','love','low','lumber','lunch','lunchroom','machine','magic','maid','mailbox','man','manager','map','marble','mark','market','mask','mass','match','meal','measure','meat','meeting','memory','men','metal','mice','middle','milk','mind','mine','minister','mint','minute','mist','mitten','mom','money','monkey','month','moon','morning','mother','motion','mountain','mouth','move','muscle','music','nail','name','nation','neck','need','needle','nerve','nest','net','news','night','noise','north','nose','note','notebook','number','nut','oatmeal','observation','ocean','offer','office','oil','operation','opinion','orange','oranges','order','organization','ornament','oven','owl','page','pail','pain','paint','pan','pancake','paper','parcel','parent','park','part','partner','party','passenger','paste','patch','payment','peace','pear','pen','pencil','person','pest','pet','pets','pleasure','plot','plough','pocket','point','poison','police','polish','pollution','popcorn','porter','position','pot','potato','powder','power','price','print','prison','process','produce','profit','property','prose','protest','pull','pump','punishment','purpose','push','quarter','quartz','queen','question','quicksand','quiet','quill','quilt','quince','quiver','rabbit','rabbits','rail','railway','rain','rainstorm','rake','range','rat','rate','ray','reaction','reading','reason','receipt','recess','record','regret','relation','religion','representative','request','respect','rest','reward','rhythm','rice','riddle','rifle','ring','rings','river','road','robin','rock','rod','roll','roof','room','root','rose','route','rub','rule','run','sack','sail','salt','sand','scale','scarecrow','scarf','scene','scent','school','science','scissors','screw','sea','seashore','seat','secretary','seed','selection','self','sense','servant','shade','shake','shame','shape','sheep','sheet','shelf','ship','shirt','shock','shoe','shoes','shop','show','side','sidewalk','sign','silk','silver','sink','sister','sisters','size','skate','skin','skirt','sky','slave','sleep','sleet','slip','slope','smash','smell','smile','smoke','snail','snails','snake','snakes','sneeze','snow','soap','society','sock','soda','sofa','son','song','songs','sort','sound','soup','space','spade','spark','spiders','sponge','spoon','spot','spring','spy','square','squirrel','stage','stamp','star','start','statement','station','steam','steel','stem','step','stew','stick','sticks','stitch','stocking','stomach','stone','stop','store','story','stove','stranger','straw','stream','street','stretch','string','structure','substance','sugar','suggestion','suit','summer','sun','support','surprise','sweater','swim','swing','system','table','tail','talk','tank','taste','tax','team','teeth','temper','tendency','tent','territory','test','texture','theory','thing','things','thought','thread','thrill','throat','throne','thumb','thunder','ticket','tiger','time','tin','title','toad','toe','toes','tomatoes','tongue','tooth','toothbrush','toothpaste','top','touch','town','toy','toys','trade','trail','train','trains','tramp','transport','tray','treatment','tree','trees','trick','trip','trouble','trousers','truck','trucks','tub','turkey','turn','twig','twist','umbrella','uncle','underwear','unit','use','vacation','value','van','vase','vegetable','veil','vein','verse','vessel','vest','view','visitor','voice','volcano','volleyball','voyage','walk','wall','war','wash','waste','watch','water','wave','waves','wax','way','wealth','weather','week','weight','wheel','whip','whistle','wilderness','wind','window','wine','wing','winter','wire','wish','woman','women','wood','wool','word','work','worm','wound','wren','wrench','wrist','writer','writing','yam','yard','yarn','year','yoke','zebra','zephyr','zinc','zipper','zoo'], 
['aback','abaft','abandoned','abashed','aberrant','abhorrent','abiding','abject','ablaze','able','abnormal','aboard','aboriginal','abortive','abounding','abrasive','abrupt','absent','absorbed','absorbing','abstracted','absurd','abundant','abusive','acceptable','accessible','accidental','accurate','acid','acidic','acoustic','acrid','actually','ad hoc','adamant','adaptable','addicted','adhesive','adjoining','adorable','adventurous','afraid','aggressive','agonizing','agreeable','ahead','ajar','alcoholic','alert','alike','alive','alleged','alluring','aloof','amazing','ambiguous','ambitious','amuck','amused','amusing','ancient','angry','animated','annoyed','annoying','anxious','apathetic','aquatic','aromatic','arrogant','ashamed','aspiring','assorted','astonishing','attractive','auspicious','automatic','available','average','awake','aware','awesome','awful','axiomatic','bad','barbarous','bashful','bawdy','beautiful','befitting','belligerent','beneficial','bent','berserk','best','better','bewildered','big','billowy','bite-sized','bitter','bizarre','black','black-and-white','bloody','blue','blue-eyed','blushing','boiling','boorish','bored','boring','bouncy','boundless','brainy','brash','brave','brawny','breakable','breezy','brief','bright','bright','broad','broken','brown','bumpy','burly','bustling','busy','cagey','calculating','callous','calm','capable','capricious','careful','careless','caring','cautious','ceaseless','certain','changeable','charming','cheap','cheerful','chemical','chief','childlike','chilly','chivalrous','chubby','chunky','clammy','classy','clean','clear','clever','cloistered','cloudy','closed','clumsy','cluttered','coherent','cold','colorful','colossal','combative','comfortable','common','complete','complex','concerned','condemned','confused','conscious','cooing','cool','cooperative','coordinated','courageous','cowardly','crabby','craven','crazy','creepy','crooked','crowded','cruel','cuddly','cultured','cumbersome','curious','curly','curved','curvy','cut','cute','cute','cynical','daffy','daily','damaged','damaging','damp','dangerous','dapper','dark','dashing','dazzling','dead','deadpan','deafening','dear','debonair','decisive','decorous','deep','deeply','defeated','defective','defiant','delicate','delicious','delightful','demonic','delirious','dependent','depressed','deranged','descriptive','deserted','detailed','determined','devilish','didactic','different','difficult','diligent','direful','dirty','disagreeable','disastrous','discreet','disgusted','disgusting','disillusioned','dispensable','distinct','disturbed','divergent','dizzy','domineering','doubtful','drab','draconian','dramatic','dreary','drunk','dry','dull','dusty','dusty','dynamic','dysfunctional','eager','early','earsplitting','earthy','easy','eatable','economic','educated','efficacious','efficient','eight','elastic','elated','elderly','electric','elegant','elfin','elite','embarrassed','eminent','empty','enchanted','enchanting','encouraging','endurable','energetic','enormous','entertaining','enthusiastic','envious','equable','equal','erect','erratic','ethereal','evanescent','evasive','even','excellent','excited','exciting','exclusive','exotic','expensive','extra-large','extra-small','exuberant','exultant','fabulous','faded','faint','fair','faithful','fallacious','false','familiar','famous','fanatical','fancy','fantastic','far','far-flung','fascinated','fast','fat','faulty','fearful','fearless','feeble','feigned','female','fertile','festive','few','fierce','filthy','fine','finicky','first','five','fixed','flagrant','flaky','flashy','flat','flawless','flimsy','flippant','flowery','fluffy','fluttering','foamy','foolish','foregoing','forgetful','fortunate','four','frail','fragile','frantic','free','freezing','frequent','fresh','fretful','friendly','frightened','frightening','full','fumbling','functional','funny','furry','furtive','future','futuristic','fuzzy','gabby','gainful','gamy','gaping','garrulous','gaudy','general','gentle','giant','giddy','gifted','gigantic','glamorous','gleaming','glib','glistening','glorious','glossy','godly','good','goofy','gorgeous','graceful','grandiose','grateful','gratis','gray','greasy','great','greedy','green','grey','grieving','groovy','grotesque','grouchy','grubby','gruesome','grumpy','guarded','guiltless','gullible','gusty','guttural','habitual','half','hallowed','halting','handsome','handsomely','handy','hanging','hapless','happy','hard','hard-to-find','harmonious','harsh','hateful','heady','healthy','heartbreaking','heavenly','heavy','hellish','helpful','helpless','hesitant','hideous','high','highfalutin','high-pitched','hilarious','hissing','historical','holistic','hollow','homeless','homely','honorable','horrible','hospitable','hot','huge','hulking','humdrum','humorous','hungry','hurried','hurt','hushed','husky','hypnotic','hysterical','icky','icy','idiotic','ignorant','ill','illegal','ill-fated','ill-informed','illustrious','imaginary','immense','imminent','impartial','imperfect','impolite','important','imported','impossible','incandescent','incompetent','inconclusive','industrious','incredible','inexpensive','infamous','innate','innocent','inquisitive','insidious','instinctive','intelligent','interesting','internal','invincible','irate','irritating','itchy','jaded','jagged','jazzy','jealous','jittery','jobless','jolly','joyous','judicious','juicy','jumbled','jumpy','juvenile','kaput','keen','kind','kindhearted','kindly','knotty','knowing','knowledgeable','known','labored','lackadaisical','lacking','lame','lamentable','languid','large','last','late','laughable','lavish','lazy','lean','learned','left','legal','lethal','level','lewd','light','like','likeable','limping','literate','little','lively','living','lonely','long','longing','long-term','loose','lopsided','loud','loutish','lovely','loving','low','lowly','lucky','ludicrous','lumpy','lush','luxuriant','lying','lyrical','macabre','macho','maddening','madly','magenta','magical','magnificent','majestic','makeshift','male','malicious','mammoth','maniacal','many','marked','massive','married','marvelous','material','materialistic','mature','mean','measly','meaty','medical','meek','mellow','melodic','melted','merciful','mere','messy','mighty','military','milky','mindless','miniature','minor','miscreant','misty','mixed','moaning','modern','moldy','momentous','motionless','mountainous','muddled','mundane','murky','mushy','mute','mysterious','naive','nappy','narrow','nasty','natural','naughty','nauseating','near','neat','nebulous','necessary','needless','needy','neighborly','nervous','new','next','nice','nifty','nimble','nine','nippy','noiseless','noisy','nonchalant','nondescript','nonstop','normal','nostalgic','nosy','noxious','null','numberless','numerous','nutritious','nutty','oafish','obedient','obeisant','obese','obnoxious','obscene','obsequious','observant','obsolete','obtainable','oceanic','odd','offbeat','old','old-fashioned','omniscient','one','onerous','open','opposite','optimal','orange','ordinary','organic','ossified','outgoing','outrageous','outstanding','oval','overconfident','overjoyed','overrated','overt','overwrought','painful','painstaking','pale','paltry','panicky','panoramic','parallel','parched','parsimonious','past','pastoral','pathetic','peaceful','penitent','perfect','periodic','permissible','perpetual','petite','petite','phobic','physical','picayune','pink','piquant','placid','plain','plant','plastic','plausible','pleasant','plucky','pointless','poised','polite','political','poor','possessive','possible','powerful','precious','premium','present','pretty','previous','pricey','prickly','private','probable','productive','profuse','protective','proud','psychedelic','psychotic','public','puffy','pumped','puny','purple','purring','pushy','puzzled','puzzling','quack','quaint','quarrelsome','questionable','quick','quickest','quiet','quirky','quixotic','quizzical','rabid','racial','ragged','rainy','rambunctious','rampant','rapid','rare','raspy','ratty','ready','real','rebel','receptive','recondite','red','redundant','reflective','regular','relieved','remarkable','reminiscent','repulsive','resolute','resonant','responsible','rhetorical','rich','right','righteous','rightful','rigid','ripe','ritzy','roasted','robust','romantic','roomy','rotten','rough','round','royal','ruddy','rude','rural','rustic','ruthless','sable','sad','safe','salty','same','sassy','satisfying','savory','scandalous','scarce','scared','scary','scattered','scientific','scintillating','scrawny','screeching','second','second-hand','secret','secretive','sedate','seemly','selective','selfish','separate','serious','shaggy','shaky','shallow','sharp','shiny','shivering','shocking','short','shrill','shut','shy','sick','silent','silent','silky','silly','simple','simplistic','sincere','six','skillful','skinny','sleepy','slim','slimy','slippery','sloppy','slow','small','smart','smelly','smiling','smoggy','smooth','sneaky','snobbish','snotty','soft','soggy','solid','somber','sophisticated','sordid','sore','sore','sour','sparkling','special','spectacular','spicy','spiffy','spiky','spiritual','spiteful','splendid','spooky','spotless','spotted','spotty','spurious','squalid','square','squealing','squeamish','staking','stale','standing','statuesque','steadfast','steady','steep','stereotyped','sticky','stiff','stimulating','stingy','stormy','straight','strange','striped','strong','stupendous','stupid','sturdy','subdued','subsequent','substantial','successful','succinct','sudden','sulky','super','superb','superficial','supreme','swanky','sweet','sweltering','swift','symptomatic','synonymous','taboo','tacit','tacky','talented','tall','tame','tan','tangible','tangy','tart','tasteful','tasteless','tasty','tawdry','tearful','tedious','teeny','teeny-tiny','telling','temporary','ten','tender','tense','tense','tenuous','terrible','terrific','tested','testy','thankful','therapeutic','thick','thin','thinkable','third','thirsty','thirsty','thoughtful','thoughtless','threatening','three','thundering','tidy','tight','tightfisted','tiny','tired','tiresome','toothsome','torpid','tough','towering','tranquil','trashy','tremendous','tricky','trite','troubled','truculent','true','truthful','two','typical','ubiquitous','ugliest','ugly','ultra','unable','unaccountable','unadvised','unarmed','unbecoming','unbiased','uncovered','understood','undesirable','unequal','unequaled','uneven','unhealthy','uninterested','unique','unkempt','unknown','unnatural','unruly','unsightly','unsuitable','untidy','unused','unusual','unwieldy','unwritten','upbeat','uppity','upset','uptight','used','useful','useless','utopian','utter','uttermost','vacuous','vagabond','vague','valuable','various','vast','vengeful','venomous','verdant','versed','victorious','vigorous','violent','violet','vivacious','voiceless','volatile','voracious','vulgar','wacky','waggish','waiting','wakeful','wandering','wanting','warlike','warm','wary','wasteful','watery','weak','wealthy','weary','well-groomed','well-made','well-off','well-to-do','wet','whimsical','whispering','white','whole','wholesale','wicked','wide','wide-eyed','wiggly','wild','willing','windy','wiry','wise','wistful','witty','woebegone','womanly','wonderful','wooden','woozy','workable','worried','worthless','wrathful','wretched','wrong','wry','xenophobic','yellow','yielding','young','youthful','yummy','zany','zealous','zesty','zippy','zonked']];
