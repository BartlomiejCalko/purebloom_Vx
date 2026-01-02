export interface EmotionalState {
    intensity: number;
    valence: number;
    heaviness: number;
    chaos: number;  // 0 = Stable, 1 = Chaotic
    energy: number;
}

export const getEmotionalInterpretation = (state: EmotionalState): string => {
    const { valence, energy, intensity, chaos, heaviness } = state;

    // Helper thresholds
    const isPleasant = valence > 0.5;
    const isEnergyHigh = energy > 0.55;
    const isEnergyLow = energy < 0.45;

    // Nuance helpers
    const isHeavy = heaviness > 0.6;
    const isLight = heaviness < 0.4;
    const isStable = chaos < 0.4;  // low chaos = stable
    const isChaotic = chaos > 0.6; // high chaos = chaotic
    const isIntense = intensity > 0.7;
    const isMild = intensity < 0.3;

    // --- QUADRANT 1: UNPLEASANT (Valence < 0.5) ---
    if (!isPleasant) {
        // Sub-Quadrant: HIGH ENERGY + UNPLEASANT (Anxiety, Anger, Frustration, Overwhelm)
        if (isEnergyHigh) {
            if (isChaotic) {
                return "W Twoim wnętrzu panuje teraz potężna burza. Wysoka energia miesza się z poczuciem chaosu, co może być trudne do uniesienia. To stan, w którym myśli pędzą, a emocje domagają się ujścia. Pamiętaj, że nawet najgwałtowniejsza nawałnica w końcu mija.";
            }
            if (isHeavy) {
                return "Czujesz duże napięcie, które zdaje się przygniatać. To połączenie siły i ciężaru może rodzić poczucie walki z czymś, co stawia opór. Twoje ciało jest zmobilizowane, choć cel tej mobilizacji może wydawać się trudny.";
            }
            if (isIntense) {
                return "Doświadczasz bardzo silnego wzburzenia. To ogień, który płonie w Tobie, niosąc ze sobą frustrację lub gniew. Ta energia jest potężna – zauważ ją, nie próbując jej na siłę gasić, pozwól jej po prostu być przez chwilę.";
            }
            return "W Twoim ciele jest dużo poruszenia i dyskomfortu. To stan gotowości, który na razie nie znajduje ukojenia. Być może czujesz potrzebę działania lub ucieczki – to naturalna reakcja na ten rodzaj napięcia.";
        }

        // Sub-Quadrant: LOW ENERGY + UNPLEASANT (Sadness, Depression, Burnout)
        if (isEnergyLow) {
            if (isHeavy) {
                return "Czujesz na sobie ogromny ciężar, który odbiera siły. To stan głębokiego wycofania, jakby grawitacja działała mocniej niż zwykle. Twoje ciało i umysł wzywają do zwolnienia, do zatrzymania się i zaopiekowania tym zmęczeniem.";
            }
            if (isChaotic) {
                return "Brakuje Ci sił, a mimo to wewnątrz panuje niepokój. To wyczerpujące uczucie, gdy chciałbyś odpocząć, ale myśli nie pozwalają Ci zasnąć. Jesteś w stanie kruchej równowagi, która potrzebuje teraz dużo łagodności.";
            }
            if (isIntense) {
                return "To, co czujesz, jest ciche, ale niezwykle dojmujące. Głęboki smutek lub rezygnacja, która przenika na wskroś. W tym stanie nie trzeba nic robić – wystarczy oddychać i pozwalać sobie czuć ten bezruch.";
            }
            return "Twój nastrój jest obniżony, a energia przygaszona. To naturalny czas 'zimy' dla Twoich emocji – moment na schowanie się przed światem, regenerację i bycie blisko samego siebie, bez wymagań.";
        }

        // Sub-Quadrant: NEUTRAL ENERGY + UNPLEASANT (Unease, Dissatisfaction)
        if (isStable) {
            return "Czujesz pewien dyskomfort, który utknął w miejscu. To stabilne, ale niezbyt przyjemne tło – jak kamień w bucie, który uwiera, ale pozwala iść dalej. Warto przyjrzeć się temu, co tak cicho domaga się Twojej uwagi.";
        }
        return "Coś Cię uwiera, choć masz siłę, by funkcjonować. To stan lekkiego rozdrażnienia lub niespełnienia. Zauważ ten dysonans – on często jest sygnałem, że jakaś Twoja potrzeba nie została zaspokojona.";
    }

    // --- QUADRANT 2: PLEASANT (Valence > 0.5) ---
    else {
        // Sub-Quadrant: HIGH ENERGY + PLEASANT (Joy, Excitement, Flow)
        if (isEnergyHigh) {
            if (isChaotic) {
                return "Rozpiera Cię ekscytacja, która aż kipi! To radosny chaos, w którym myśli skaczą jak iskry. Mnóstwo pomysłów, chęć działania, entuzjazm – Twoja energia tańczy i zaprasza do zabawy.";
            }
            if (isLight) {
                return "Czujesz się lekko, jakbyś unosił się nad ziemią. To czysta radość i beztroska. Masz w sobie dużo jasnej energii, która sprawia, że wszystko wydaje się prostsze i możliwe do zrobienia.";
            }
            if (isStable) {
                return "Masz w sobie potężną, ale i uporządkowaną moc. To stan 'flow' – pełna koncentracja, pewność siebie i sprawczość. Wiesz, co robić, i masz do tego wszelkie zasoby. Wykorzystaj ten moment!";
            }
            return "Twoja energia wibruje na wysokim poziomie. Czujesz witalność i chęć do życia. To świetny moment, by skierować tę siłę na to, co jest dla Ciebie ważne, lub po prostu cieszyć się ruchem.";
        }

        // Sub-Quadrant: LOW ENERGY + PLEASANT (Calm, Relaxation, Serenity)
        if (isEnergyLow) {
            if (isHeavy) {
                return "Odczuwasz głęboki, bezpieczny ciężar relaksu. Jak pod ciepłym, ciężkim kocem. To stan błogiego uziemienia, w którym Twoje ciało w końcu może puścić napięcia i zapaść się w miękki odpoczynek.";
            }
            if (isLight) {
                return "Jesteś w przestrzeni delikatnego wyciszenia. Twoje myśli płyną wolno, jak chmury na niebie. To stan lekkości i łagodności, w którym nic nie musisz, a wszystko możesz. Delektuj się tą ciszą.";
            }
            if (isStable) {
                return "Ogarnia Cię kojący spokój. Wszystko jest na swoim miejscu. Jesteś stabilną skałą pośród fal – nic nie jest w stanie łatwo Cię poruszyć. To fundament, na którym buduje się prawdziwą regenerację.";
            }
            return "Odpoczywasz. Twoja energia jest na niskim biegu, ale to przyjemny stan ładowania baterii. Pozwól sobie na to 'nicnierobienie' – ono jest teraz najbardziej produktywną rzeczą pod słońcem.";
        }

        // Sub-Quadrant: NEUTRAL ENERGY + PLEASANT (Contentment, Balance)
        if (isStable) {
            return "Jesteś w stanie harmonijnej równowagi. Ani za wysoko, ani za nisko – w sam raz. To spokój płynący z akceptacji tego, co jest. Dobry, stabilny moment, by po prostu Być.";
        }
        return "Czujesz się dobrze. Jest w Tobie pogoda ducha i umiarkowana energia. To przyjemna codzienność, która nie fajerwerków, by dawać satysfakcję. Ciesz się tą prostą, dobrą chwilą.";
    }

    // --- FALLBACK (Just in case) ---
    return "Jesteś w złożonym stanie emocjonalnym, który trudno jednoznacznie określić. Każda emocja jest ważna – daj sobie chwilę, by po prostu z nią pobyć i poobserwować ją bez oceniania.";
};
