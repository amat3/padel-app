// utils/ranking.ts
export const calcularRanking = (resultados: { resultadoJugador1: number, resultadoJugador2: number }[]) => {
  let puntosJugador1 = 0;
  let puntosJugador2 = 0;

  resultados.forEach(resultado => {
    if (resultado.resultadoJugador1 > resultado.resultadoJugador2) {
      puntosJugador1 += 3;  // Gana el jugador 1
    } else if (resultado.resultadoJugador2 > resultado.resultadoJugador1) {
      puntosJugador2 += 3;  // Gana el jugador 2
    } else {
      puntosJugador1 += 1;  // Empate
      puntosJugador2 += 1;
    }
  });

  return {
    jugador1: puntosJugador1,
    jugador2: puntosJugador2,
  };
};
