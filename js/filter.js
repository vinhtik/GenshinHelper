
document.addEventListener('DOMContentLoaded', () => {
    const sortFilters = document.querySelectorAll('.sort-filter');
    const iconFilters = document.querySelectorAll('.icon-filter');
    const resetButton = document.getElementById('reset-filters');
    const characterList = document.getElementById('character-list');
    let currentFilters = {}; // Текущие фильтры

    // Загрузка персонажей
    function fetchFilteredCharacters() {
        fetch('php/filter_characters.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentFilters),
        })
            .then(response => response.json())
            .then(data => {
                characterList.innerHTML = '';

                if (data.length === 0) {
                    characterList.innerHTML = '<p>Персонажи не найдены</p>';
                    return;
                }

                data.forEach(character => {
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
            })
            .catch(error => console.error('Error fetching characters:', error));
    }

    // Изначально загружаем всех персонажей
    fetchFilteredCharacters();

   // Функция для обновления активных фильтров
   function updateActiveFilters() {
    iconFilters.forEach(filter => {
        const filterType = filter.dataset.filterType;
        const filterValue = filter.dataset.filterValue;

        if (currentFilters[filterType] && currentFilters[filterType].includes(filterValue)) {
            filter.classList.add('active');
        } else {
            filter.classList.remove('active');
        }
    });

    // Для сортировки проверяем, какой сортировочный фильтр активен
    sortFilters.forEach(filter => {
        const filterType = filter.dataset.filterType;
        const sortOrder = filter.dataset.sort;

        if (currentFilters[filterType]?.sort === sortOrder) {
            filter.classList.add('active');
        } else {
            filter.classList.remove('active');
        }
    });
}



    
    

    // Функция для сброса активного класса
    function resetActiveClass(filters) {
        filters.forEach(filter => filter.classList.remove('active'));
    }

    sortFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            const filterType = filter.dataset.filterType;
            const sortOrder = filter.dataset.sort;
    
            // Вместо currentFilters.sorting, просто добавляем фильтр на верхний уровень
            currentFilters[filterType] = { sort: sortOrder };
    
            fetchFilteredCharacters(); // Загружаем отфильтрованных персонажей
            updateActiveFilters(); // Обновляем активные фильтры
        });
    });
    


    iconFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            const filterType = filter.dataset.filterType;
            const filterValue = filter.dataset.filterValue;
    
            // Добавляем или удаляем фильтр в currentFilters
            if (currentFilters[filterType]?.includes(filterValue)) {
                currentFilters[filterType] = currentFilters[filterType].filter(value => value !== filterValue);
            } else {
                currentFilters[filterType] = currentFilters[filterType] || [];
                currentFilters[filterType].push(filterValue);
            }
    
            fetchFilteredCharacters(); // Загружаем отфильтрованных персонажей
            updateActiveFilters(); // Обновляем активные фильтры
        });
    });
    
    // Обработчик сброса фильтров
    resetButton.addEventListener('click', () => {
        currentFilters = {};
        fetchFilteredCharacters();

        // Сброс всех активных классов
        resetActiveClass(sortFilters);
        resetActiveClass(iconFilters);
    });

    // Динамическое создание модального окна
    function openModal(character) {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <img class="icon" src='../assets/icons/${character.character_name}.webp'>
            <h2>${character.character_name}</h2>
            <p><strong>Базовое здровоье:</strong> ${character.hp_90_90}</p>
            <p><strong>Базовая сила атаки:</strong> ${character.atk_90_90}</p>
            <p><strong>Базовая защита:</strong> ${character.def_90_90}</p>
            <p><strong>Бонус при возвышении:</strong> ${character.ascension_special_stat} ${character.special_6}</p>
            <p><strong>Элемент:</strong> ${character.vision}</p>
            <p><strong>Тип оружия:</strong> ${character.weapon_type}</p>
            <p><strong>Редкость:</strong> ${character.star_rarity}★</p>
            <p><strong>Дата выхода:</strong> ${character.release_date}</p>
            <p><strong>Созвездие:</strong> ${character.constellation}</p>
            <p><strong>День рождения:</strong> ${character.birthday}</p>
            <p><strong>Группа:</strong> ${character.affiliation}</p>
            <p><strong>Возвышение:</strong> ${character.ascension_specialty}</p>
        </div>
    `;
        document.body.appendChild(modal);

        const closeButton = modal.querySelector('.close');
        closeButton.addEventListener('click', () => modal.remove());

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Открытие модального окна по клику
    characterList.addEventListener('click', (event) => {
        const characterDiv = event.target.closest('.container');
        if (characterDiv) {
            const characterName = characterDiv.getAttribute('data-name');
            fetch(`php/get_character.php?name=${encodeURIComponent(characterName)}`)
                .then(response => response.json())
                .then(data => {
                    if (data && Object.keys(data).length > 0) {
                        openModal(data);
                    } else {
                        alert('Данные персонажа не найдены');
                    }
                })
                .catch(error => console.error('Error fetching character details:', error));
        }
    });
});


