document.addEventListener('DOMContentLoaded', () => {
    const sortFilters = document.querySelectorAll('.sort-filter');
    const iconFilters = document.querySelectorAll('.icon-filter');
    const resetButton = document.getElementById('reset-filters');
    const weaponList = document.getElementById('weapon-list');
    let currentFilters = {}; // Текущие фильтры

    // Загрузка оружий
    function fetchFilteredWeapons() {
        fetch('php/filter_weapons.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentFilters),
        })
            .then(response => response.json())
            .then(data => {
                weaponList.innerHTML = '';

                if (data.length === 0) {
                    weaponList.innerHTML = '<p>Оружия не найдены</p>';
                    return;
                }

                data.forEach(weapon => {
                    const weaponRow = document.createElement('tr');

                    weaponRow.innerHTML = `
                        <td><img src="../assets/icons/${weapon.weapon_name}.webp" alt="${weapon.weapon_name}" class="weapon-img"></td>
                        <td>${weapon.weapon_name}</td>
                        <td>${weapon.type}</td>
                        <td>${weapon.rarity}★</td>
                        <td>${weapon.max_atk}</td>
                        <td>${weapon.substat_type ? `${weapon.substat_type} (${weapon.max_substat})` : '-'}</td>
                    `;
                    weaponList.appendChild(weaponRow);
                });
            })
            .catch(error => console.error('Error fetching weapons:', error));
    }

    // Изначально загружаем все оружия
    fetchFilteredWeapons();

    // Функция для обновления активных фильтров
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

    sortFilters.forEach(filter => {
        const filterType = filter.dataset.filterType;
        const sortOrder = filter.dataset.sort;

        // Если сортировка соответствует активному фильтру, подсвечиваем
        if (currentFilters.sorting && currentFilters.sorting[filterType] === sortOrder) {
            filter.classList.add('active');
        } else {
            filter.classList.remove('active');
        }
    });
}

    
    

    // Обработчики сортировки
    sortFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            const filterType = filter.dataset.filterType;
            const sortOrder = filter.dataset.sort;

            currentFilters.sorting = currentFilters.sorting || {};
            currentFilters.sorting[filterType] = sortOrder;

            fetchFilteredWeapons();
            updateActiveFilters();
        });
    });

    // Обработчики фильтров по иконкам (тип оружия, редкость)
    iconFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            const filterType = filter.dataset.filterType;
            const filterValue = filter.dataset.filterValue;

            if (currentFilters[filterType]?.includes(filterValue)) {
                currentFilters[filterType] = currentFilters[filterType].filter(value => value !== filterValue);
            } else {
                currentFilters[filterType] = currentFilters[filterType] || [];
                currentFilters[filterType].push(filterValue);
            }

            fetchFilteredWeapons();
            updateActiveFilters();
        });
    });

    // Обработчик сброса фильтров
    resetButton.addEventListener('click', () => {
        currentFilters = {};
        fetchFilteredWeapons();

        // Сброс всех активных классов
        iconFilters.forEach(filter => filter.classList.remove('active'));
        sortFilters.forEach(filter => filter.classList.remove('active'));
    });
});
