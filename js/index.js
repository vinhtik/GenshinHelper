document.addEventListener('DOMContentLoaded', () => {
    const selectedCharacterSlot = document.getElementById('selected-character-slot');
    const predictionSlots = document.querySelectorAll('.prediction-slot');
    const characterList = document.getElementById('character-list');
    const resetTeamButton = document.getElementById('reset-team'); // Кнопка сброса команды
    const searchInput = document.getElementById('search-character'); // Поле поиска
    let charactersData = []; // Список всех персонажей
    let selectedCharacter = null; // Переменная для выбранного персонажа

    // Загрузка персонажей (это может быть как из вашей базы данных, так и через API)
    function fetchCharacters() {
        fetch('php/filter_characters.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // Параметры фильтрации
        })
            .then(response => response.json())
            .then(data => {
                charactersData = data; // Сохраняем данные для последующей фильтрации
                renderCharacters(data);
            })
            .catch(error => console.error('Error fetching characters:', error));
    }

    // Рендеринг персонажей
    function renderCharacters(characters) {
        characterList.innerHTML = '';

        if (characters.length === 0) {
            characterList.innerHTML = '<p>Персонажи не найдены</p>';
            return;
        }

        characters.forEach(character => {
            const rarityClass = character.star_rarity === 5 ? 'rarity-5' : 'rarity-4';
            const characterDiv = document.createElement('div');
            characterDiv.classList.add('container', rarityClass);
            characterDiv.setAttribute('data-name', character.character_name);

            const imgIcon = document.createElement('img');
            imgIcon.classList.add('icon');
            imgIcon.src = `../assets/icons/${character.character_name}.webp`;
            imgIcon.alt = character.character_name;

            const imgVision = document.createElement('img');
            imgVision.classList.add('vision');
            imgVision.src = `../assets/icons/${character.vision}.webp`;
            imgVision.alt = character.vision;

            const name = document.createElement('p');
            name.textContent = character.character_name;

            characterDiv.appendChild(imgIcon);
            characterDiv.appendChild(imgVision);
            characterDiv.appendChild(name);
            characterList.appendChild(characterDiv);
        });
    }

    fetchCharacters();

    // Обновление выбранного персонажа
    function updateSelectedCharacter(characterName, predictedCharacters) {
        selectedCharacter = characterName;

        // Запрос для получения информации о выбранном персонаже
        fetch(`php/get_character.php?name=${encodeURIComponent(characterName)}`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    const rarityClass = data.star_rarity === 5 ? 'rarity-5' : 'rarity-4';

                    selectedCharacterSlot.innerHTML = `
                        <div class="container ${rarityClass}">
                            <img class="icon" src="../assets/icons/${characterName}.webp" alt="${characterName}">
                            <p>${characterName}</p>
                        </div>
                    `;
                } else {
                    selectedCharacterSlot.innerHTML = '<p>Нет данных о персонаже</p>';
                }
            })
            .catch(error => console.error('Ошибка при получении данных о выбранном персонаже:', error));

        // Обновление слотов для предсказанных персонажей
        predictionSlots.forEach((slot, index) => {
            if (predictedCharacters[index]) {
                const predictedCharacter = predictedCharacters[index];

                // Запрос для получения данных о предсказанном персонаже
                fetch(`php/get_character.php?name=${encodeURIComponent(predictedCharacter)}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data) {
                            const rarityClass = data.star_rarity === 5 ? 'rarity-5' : 'rarity-4';

                            slot.innerHTML = `
                                <div class="container ${rarityClass}">
                                    <img class="icon" src="../assets/icons/${predictedCharacter}.webp" alt="${predictedCharacter}">
                                    <p>${predictedCharacter}</p>
                                </div>
                            `;
                        } else {
                            slot.innerHTML = '<p>Нет данных о персонаже</p>';
                        }
                    })
                    .catch(error => console.error('Ошибка при получении данных о персонаже:', error));
            } else {
                slot.innerHTML = `
                    <div class="container">
                        <p></p>
                    </div>
                `; // Пустая карточка вместо текста
            }
        });
    }

    // Обработчик клика на персонаж
    characterList.addEventListener('click', (event) => {
        const characterDiv = event.target.closest('.container');
        if (characterDiv) {
            const characterName = characterDiv.getAttribute('data-name');
            fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ character: characterName })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.predicted_characters) {
                        updateSelectedCharacter(characterName, data.predicted_characters);
                    } else {
                        console.error('Ошибка в получении предсказанных персонажей');
                    }
                })
                .catch(error => console.error('Ошибка при запросе на сервер:', error));
        }
    });

    // Сброс команды
    resetTeamButton.addEventListener('click', () => {
        selectedCharacter = null;
        selectedCharacterSlot.innerHTML = `
             <div id="selected-character-slot">
                <div class="predictcontainer">
                <p>Выберите персонажа</p>
            </div>
        `;
        predictionSlots.forEach(slot => {
            slot.innerHTML = `
                    <div class="predictcontainer">
                    </div>
            `; // Пустая карточка вместо текста
        });
    });

    // Поиск по имени
    searchInput.addEventListener('input', () => {
        const searchValue = searchInput.value.toLowerCase().trim();
        const filteredCharacters = charactersData.filter(character =>
            character.character_name.toLowerCase().includes(searchValue)
        );
        renderCharacters(filteredCharacters);
    });
});
