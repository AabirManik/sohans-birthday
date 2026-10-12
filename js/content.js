/* ==========================================================================
   content.js — THE ONLY FILE YOU NEED TO EDIT
   --------------------------------------------------------------------------
   Everything personal lives here: the name, the headings, the captions,
   the letter, the sign-off, the alt text and the birthday date.
   Layout and animation live in css/ and js/app.js — no need to touch those.
   ========================================================================== */

window.CONTENT = (function () {
  return {

    /* ---------------- recipient & sender ---------------- */
    name: "Sohan",

    /* Optional. Leave as null and no date, age or countdown is ever shown.
       Example: birthdayDate: "12 October"  (only add it if you want it displayed) */
    birthdayDate: null,

    /* The letter's sign-off. `\n` starts a new line. */
    signOff: "Forever yours,\nYour favourite person 💗",

    /* ---------------- scene 1 ---------------- */
    coverTitle: "Sohan's Birthday",
    coverTitleAccent: "for Sohan",
    coverLine: "For my favourite person, on his favourite day.",
    sealLine: "A little surprise, made only for you.",
    unlockLabel: "Unlock your birthday surprise",

    /* ---------------- scene 2 ---------------- */
    happyBirthdayHeading: "Happy Birthday, Sohan!",
    spotlightLede: "Today, the whole little universe is celebrating you.",
    heroCaption: "The birthday boy",
    heroAlt: "Sohan in a dark jacket and sunglasses against a pink event backdrop",

    /* ---------------- scene 3 — memories ----------------
       Add, remove or reorder entries freely.
       size: "wide" (7 columns) | "narrow" (5 columns) | omit for the default half row.
       Sizes are chosen so every row adds up to 12 — keep that balance and the
       grid stays tidy:  wide + narrow, narrow + wide, default + default.
       focal: where the face sits, as object-position — "50% 30%" keeps faces in frame. */
    memories: [
      { group: "Moments we kept" },
      {
        src: "public/images/together-close.jpg",
        caption: "My favourite person, right beside me.",
        alt: "A close-up selfie of the couple dressed for an occasion",
        size: "wide",
        focal: "50% 32%"
      },
      {
        src: "public/images/together-cafe.jpg",
        caption: "A little moment I want to keep forever.",
        alt: "The couple smiling together at a cafe",
        size: "narrow",
        focal: "50% 34%"
      },
      {
        src: "public/images/together-hallway.jpg",
        caption: "Every version of us is my favourite.",
        alt: "The couple smiling together in a hallway",
        size: "narrow",
        focal: "50% 30%"
      },
      {
        src: "public/images/her-garden.jpg",
        caption: "Somewhere quiet, thinking of you.",
        alt: "A portrait of Sohan’s girlfriend in a blue sari in a garden",
        size: "wide",
        focal: "50% 26%"
      },
      { group: "You, being you" },
      {
        src: "public/images/sohan-traditional.jpg",
        caption: "One of my favourite views: you.",
        alt: "Sohan in a plum traditional outfit and sunglasses",
        focal: "50% 24%"
      },
      {
        src: "public/images/sohan-hero.jpg",
        caption: "Every little thing you do, I notice.",
        alt: "Sohan in a dark jacket and sunglasses against a pink event backdrop",
        focal: "50% 28%"
      }
    ],

    /* ---------------- scene 4 ---------------- */
    heroCaptionLine: "“Even superheroes need someone to come home to.”",
    heroSceneLabel:
      "Three original vintage-comic panels show a red-and-blue web hero swinging above the city, pausing on a moonlit rooftop, and sharing a gentle upside-down kiss.",

    /* ---------------- scene 5 — the garage ----------------
       Add or remove cars freely: the bays, the names and the
       collection count all follow this list.
       bay (desktop diorama only): where the car sits inside the
       showroom photo — x / y are the centre point in %, w is the
       car's width in % of the photo. On phones the cars fall back
       to a swipeable shelf, so bay can be left off entirely. */
    garageHeading: "Six little legends, one lit-up shelf",
    garageLede: "Every car you love, parked in its own lit bay — waiting for you to walk past.",
    garagePlate: "Parked, polished, and waiting for you",
    cars: [
      {
        name: "Bugatti Chiron",
        src: "public/images/hotwheels/cars/bugatti-chiron.png",
        alt: "A blue Bugatti Chiron die-cast car, shown in three-quarter view",
        bay: { x: 74.5, y: 45.4, w: 13 }
      },
      {
        name: "McLaren P1",
        src: "public/images/hotwheels/cars/mclaren-p1.png",
        alt: "An orange McLaren P1 die-cast car, shown in three-quarter view",
        bay: { x: 74.5, y: 56.9, w: 12 }
      },
      {
        name: "Ferrari Enzo",
        src: "public/images/hotwheels/cars/ferrari-enzo.png",
        alt: "A red Ferrari Enzo die-cast car, shown in three-quarter view",
        bay: { x: 66.5, y: 72.2, w: 11 }
      },
      {
        name: "Lamborghini Huracán",
        src: "public/images/hotwheels/cars/lamborghini-huracan.png",
        alt: "A green Lamborghini Huracán die-cast car with a black wing, shown in three-quarter view",
        bay: { x: 24.5, y: 72.3, w: 11 }
      },
      {
        name: "Dodge Charger",
        src: "public/images/hotwheels/cars/dodge-charger.png",
        alt: "A black Dodge Charger die-cast muscle car with red stripes, shown in three-quarter view",
        bay: { x: 38.5, y: 72.1, w: 11 }
      },
      {
        name: "Porsche 911 GT3 RS",
        src: "public/images/hotwheels/cars/porsche-911-gt3-rs.png",
        alt: "A silver Porsche 911 GT3 RS die-cast car with a red-accented wing, shown in three-quarter view",
        bay: { x: 52.5, y: 71.7, w: 12 }
      }
    ],

    /* ---------------- scene 6 — the letter ----------------
       One entry per paragraph. Keep her words as they are. */
    letter: [
      "First of all, a very happy birthday to the most special person in my life—my love, my happiness, and my forever person. 🥹❤️",
      "You are not just my love; you are my best friend, my biggest support, my comfort, and my whole world. I feel so lucky to have you in my life. Every moment with you is precious to me, and your smile is one of my favourite things in this world. 🫶🏻",
      "On your special day, I pray to God to bless you with lots of happiness, good health, success, and endless love. May all your dreams come true, and may you always keep smiling. I promise to stand by your side through every up and down, to love you a little more every day, and to hold your hand forever. 💍❤️",
      "You make my life more beautiful just by being in it. No words can truly express how much I love you. If I could give you one thing in life, I would give you the ability to see yourself through my eyes, because then you would understand how special you are to me. 🥹💗",
      "You are my today, my tomorrow, and my forever. I want to grow old with you, make countless beautiful memories, and spend the rest of my life loving you. No matter how many birthdays come and go, my love for you will always keep growing. 💋❤️",
      "Happy birthday once again, my love. 😘💟",
      "I love you more than words can ever explain. You will always be the king of my heart and the man of my dreams. May our love grow stronger with every passing day. ❤️🫂"
    ],
    letterKicker: "For you, on your day",
    letterTitle: "Happy birthday, my love",
    letterClosedNote: "There is something here for you. It has been waiting.",
    openLetterLabel: "Open my letter",

    /* ---------------- scene 7 ---------------- */
    finaleHeading: "Happy Birthday, Sohan",
    finaleLede: "Here's to every laugh, every little adventure, and all the birthdays still waiting for us.",
    wishLabel: "Make a wish",
    finalLine: "I love you. Always.",
    finalSignOff: "Forever yours, Your favourite person 💗",

    /* ---------------- misc ---------------- */
    footNote: "Made for you. Nothing here leaves this page.",

    /* Scene names used for the progress dots / screen readers. */
    sceneTitles: [
      "The sealed surprise",
      "Birthday spotlight",
      "Our precious memories",
      "Our little superhero comic",
      "Sohan's Hot Wheels garage",
      "A letter from your favourite person",
      "Make a wish"
    ]
  };
})();
