import React from "react";

/** Abre a página de um produto de qualquer lugar do site */
export const NavContext = React.createContext({ openPage: () => {}, openQuiz: () => {} });
export const useNav = () => React.useContext(NavContext);

/** Contexto com a loja atual, disponível para qualquer componente via useStore() */
export const StoreContext = React.createContext(null);
export const useStore = () => React.useContext(StoreContext);
export const CloudContext = React.createContext({ status: "local", isAdmin: false, uid: null });
export const useCloud = () => React.useContext(CloudContext);

/* ---------------------------------------------------------------------------
 * AVALIAÇÕES
 * ------------------------------------------------------------------------- */
export const ReviewsContext = React.createContext({ approved: [], mine: [], submit: async () => false, stats: {} });
export const useReviews = () => React.useContext(ReviewsContext);
