document.addEventListener("DOMContentLoaded", function() {
    const input = document.getElementById("in1");
    const searchButton = document.querySelector(".buttonSearch");
    const errorContainer = document.querySelector(".containerError");
    const infoContainer = document.querySelector(".containerInfo");
    const evolutionButton = document.querySelector(".buttonEvolution");
    const evolButtonContainer = document.querySelector(".containerEvolution");

    const baseUrl = "https://pokeapi.co/api/v2/pokemon/";
    const speciesUrl = "https://pokeapi.co/api/v2/pokemon-species/";

    let evolutionChain = []; // Almacenar las evoluciones disponibles
    let evolutionIndex = 0; // Índice actual de la evolución mostrada

    searchButton.addEventListener("click", function() {
        const pokemonName = input.value.trim().toLowerCase();
        if (pokemonName === "") return;

        errorContainer.style.display = "none";
        infoContainer.style.display = "block";

        fetchPokemonData(pokemonName);
    });

    async function fetchPokemonData(pokemonName) {
        try {
            const response = await fetch(baseUrl + pokemonName);
            if (!response.ok) {
                throw new Error("No se encontró el Pokémon.");
            }

            const pokemonData = await response.json();
            const speciesResponse = await fetch(speciesUrl + pokemonData.species.name);
            const speciesData = await speciesResponse.json();

            console.log(pokemonData, speciesData); // Añadido para depuración

            evolutionChain = await fetchEvolutionChain(speciesData); // Obtener la cadena de evolución
            evolutionIndex = 0; // Restablecer el índice al inicio
            displayPokemonInfo(pokemonData, speciesData);
        } catch (error) {
            displayError();
            console.error(error);
        }
    }

    async function fetchEvolutionChain(speciesData) {
        const evolutionChainUrl = speciesData.evolution_chain.url;
        const evolutionData = await fetch(evolutionChainUrl);
        const evolutionJson = await evolutionData.json();

        // Extraer y retornar las evoluciones disponibles
        return extractEvolutions(evolutionJson.chain);
    }

    function extractEvolutions(chain) {
        const evolutions = [];
        const queue = [chain];

        // Recorrer la cadena de evolución y extraer los nombres de las especies
        while (queue.length > 0) {
            const current = queue.shift();
            evolutions.push(current.species.name);

            for (const evolution of current.evolves_to) {
                queue.push(evolution);
            }
        }

        return evolutions;
    }

    async function displayPokemonInfo(pokemonData, speciesData) {
        const name = pokemonData.name;
        const imageUrl = pokemonData.sprites.front_default;
        const type = pokemonData.types.map(type => type.type.name).join(", ");
        const description = speciesData.flavor_text_entries.find(entry => entry.language.name === "es").flavor_text;
        const abilities = pokemonData.abilities.map(ability => ability.ability.name).join(", ");

        document.querySelector(".pokemonName").textContent = name;
        document.querySelector(".pokemonImg").src = imageUrl;
        document.querySelector(".pokemonType").textContent = type;
        document.querySelector(".pokemonDescription").textContent = description;
        document.querySelector(".pokemonAbilities").textContent = abilities;

        updateEvolutionButton();
    }

    function updateEvolutionButton() {
        if (evolutionIndex < evolutionChain.length - 1) {
            evolutionButton.style.display = "block";
            evolutionButton.textContent = `Evolucionar a ${evolutionChain[evolutionIndex + 1]}`;
        } else {
            evolutionButton.style.display = "none";
        }
    }

    function displayError() {
        errorContainer.style.display = "block";
        infoContainer.style.display = "none";
        evolButtonContainer.style.display = "none";
    }

    evolutionButton.addEventListener("click", function() {
        if (evolutionIndex < evolutionChain.length - 1) {
            evolutionIndex++;
            const nextPokemon = evolutionChain[evolutionIndex];
            fetchPokemonData(nextPokemon);
        }
    });
});

