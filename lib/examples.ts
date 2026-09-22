// Situations d'exemple pour le placeholder du formulaire. Par convention du
// projet (voir CLAUDE.md), CURRENT_EXAMPLE_INDEX avance d'un cran à chaque
// version publiée, pour ne jamais montrer deux fois de suite le même exemple.
export const EXAMPLES = [
  "La rentrée des classes quand on a 8 ans.",
  "Le premier jour de vacances d'été, valise à peine posée.",
  "Un dimanche pluvieux passé au lit avec un bon livre.",
  "Souffler les bougies de son anniversaire entouré de sa famille.",
  "Rentrer chez soi après un long voyage.",
  "La première neige de l'hiver, vue depuis la fenêtre.",
  "Un feu de camp sur la plage, en fin d'été.",
  "Retrouver un ami d'enfance après des années.",
  "Le marché du samedi matin, encore un peu endormi.",
  "S'endormir dans une voiture au retour de vacances.",
];

// Même liste, même ordre, pour le sélecteur de langue (voir lib/i18n.ts).
export const EXAMPLES_EN = [
  "The first day back at school when you're 8 years old.",
  "The first day of summer vacation, suitcase barely put down.",
  "A rainy Sunday spent in bed with a good book.",
  "Blowing out your birthday candles surrounded by family.",
  "Coming home after a long trip.",
  "The first snow of winter, watched from the window.",
  "A campfire on the beach, at the end of summer.",
  "Running into a childhood friend after years apart.",
  "The Saturday morning market, still half asleep.",
  "Falling asleep in the car on the way back from vacation.",
];

export const CURRENT_EXAMPLE_INDEX = 5;

export const CURRENT_EXAMPLE = EXAMPLES[CURRENT_EXAMPLE_INDEX];
export const CURRENT_EXAMPLE_EN = EXAMPLES_EN[CURRENT_EXAMPLE_INDEX];
