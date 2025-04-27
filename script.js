let meals = [];

document.getElementById('loadMeals').addEventListener('click', () => {
    fetch('meals.json')
        .then(response => response.json())
        .then(data => {
            meals = data;
            displayMealSelection(meals);
        });
});

function displayMealSelection(meals) {
    const container = document.getElementById('mealSelection');
    container.innerHTML = '';
    meals.forEach((meal, index) => {
        container.innerHTML += \`
            <input type="checkbox" id="meal_\${index}" data-index="\${index}">
            <label for="meal_\${index}">\${meal.name} (Carbs: \${meal.carbs}, Fat: \${meal.fat}, Protein: \${meal.protein})</label><br>
        \`;
    });
}

document.getElementById('optimizeMeals').addEventListener('click', () => {
    const selectedMeals = [];
    document.querySelectorAll('#mealSelection input[type=checkbox]').forEach(checkbox => {
        if (checkbox.checked) {
            selectedMeals.push(meals[checkbox.dataset.index]);
        }
    });

    const targetCarbs = parseInt(document.getElementById('targetCarbs').value);
    const targetFat = parseInt(document.getElementById('targetFat').value);
    const targetProtein = parseInt(document.getElementById('targetProtein').value);

    optimize(selectedMeals, targetCarbs, targetFat, targetProtein);
});

function optimize(selectedMeals, targetCarbs, targetFat, targetProtein) {
    let bestPlan = null;
    let bestScore = -1;

    for (let r = 3; r <= 5; r++) {
        const combinations = getCombinations(selectedMeals, r);
        combinations.forEach(combo => {
            const totalCarbs = combo.reduce((sum, meal) => sum + meal.carbs, 0);
            const totalFat = combo.reduce((sum, meal) => sum + meal.fat, 0);
            const totalProtein = combo.reduce((sum, meal) => sum + meal.protein, 0);

            if (totalCarbs <= targetCarbs && totalFat <= targetFat && totalProtein <= targetProtein) {
                const score = totalCarbs + totalFat + totalProtein;
                if (score > bestScore) {
                    bestScore = score;
                    bestPlan = { combo, totalCarbs, totalFat, totalProtein };
                }
            }
        });
    }

    displayResult(bestPlan, targetCarbs, targetFat, targetProtein);
}

function getCombinations(arr, r) {
    const results = [];
    function combine(temp, start, r) {
        if (r === 0) {
            results.push([...temp]);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            temp.push(arr[i]);
            combine(temp, i + 1, r - 1);
            temp.pop();
        }
    }
    combine([], 0, r);
    return results;
}

function displayResult(plan, targetCarbs, targetFat, targetProtein) {
    const output = document.getElementById('output');
    if (!plan) {
        output.innerHTML = '<p>No valid meal plan found.</p>';
        return;
    }

    output.innerHTML = '<ul>' + plan.combo.map(meal => \`<li>\${meal.name} (Carbs: \${meal.carbs}, Fat: \${meal.fat}, Protein: \${meal.protein})</li>\`).join('') + '</ul>';
    output.innerHTML += \`<p><strong>Total Carbs:</strong> \${plan.totalCarbs}g (Target: \${targetCarbs}g)</p>\`;
    output.innerHTML += \`<p><strong>Total Fat:</strong> \${plan.totalFat}g (Target: \${targetFat}g)</p>\`;
    output.innerHTML += \`<p><strong>Total Protein:</strong> \${plan.totalProtein}g (Target: \${targetProtein}g)</p>\`;
}