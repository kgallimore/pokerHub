// place files you want to import through the `$lib` alias in this folder.
export interface CardDetails {suit: string, rank: string}
export type CardHand = [CardDetails, CardDetails] | []
export interface TableCardDetails {playerHands: [CardHand,CardHand,CardHand,CardHand,CardHand,CardHand,CardHand,CardHand]}