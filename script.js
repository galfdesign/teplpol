let chart = null;

function generateInputs() {
    const loopCount = parseInt(document.getElementById("loopCount").value);
    const inputsDiv = document.getElementById("inputs");
    inputsDiv.innerHTML = "<h3>Параметры контуров</h3>";

    for (let i = 1; i <= loopCount; i++) {
        inputsDiv.innerHTML += `
            <div style="margin: 10px 0; padding: 10px; border: 1px solid #eee;">
                <h4>Контур ${i}</h4>
                <label>Длина трубы (м): </label><input type="number" id="length${i}" min="1" value="50"><br>
                <label>Внутр. диаметр (мм): </label><input type="number" id="diameter${i}" min="8" max="20" value="16"><br>
                <label>Площадь (м²): </label><input type="number" id="area${i}" min="1" value="15"><br>
                <label>Удельная мощность (Вт/м²): </label><input type="number" id="power${i}" min="30" max="200" value="80">
            </div>
        `;
    }
}

function calculate() {
    const loopCount = parseInt(document.getElementById("loopCount").value);
    const deltaT = parseFloat(document.getElementById("deltaT").value);
    const resultsBody = document.getElementById("resultsBody");
    resultsBody.innerHTML = "";

    const labels = [];
    const flowRates = [];
    const velocities = [];
    const statuses = [];

    for (let i = 1; i <= loopCount; i++) {
        const length = parseFloat(document.getElementById(`length${i}`).value);
        const diameter = parseFloat(document.getElementById(`diameter${i}`).value);
        const area = parseFloat(document.getElementById(`area${i}`).value);
        const powerDensity = parseFloat(document.getElementById(`power${i}`).value);

        // Расчет мощности (Вт)
        const power = area * powerDensity;

        // Расчет расхода (л/мин)
        const flowRate = (power / (4.2 * deltaT * 60)) * 1000; // Q / (c * Δt * 60) * 1000

        // Расчет скорости потока (м/с)
        const pipeArea = Math.PI * Math.pow(diameter / 1000 / 2, 2); // площадь сечения трубы (м²)
        const velocity = (flowRate / 1000 / 60) / pipeArea; // м³/с / м² → м/с

        // Проверка на допустимую скорость (обычно < 0.5–1 м/с)
        let status = "✅ Норма";
        if (velocity > 0.8) status = "⚠️ Высокая скорость (шум)";
        if (velocity > 1.2) status = "❌ Опасная скорость";

        // Добавление в таблицу
        resultsBody.innerHTML += `
            <tr>
                <td>${i}</td>
                <td>${length}</td>
                <td>${diameter}</td>
                <td>${power.toFixed(1)}</td>
                <td>${flowRate.toFixed(2)}</td>
                <td>${velocity.toFixed(3)}</td>
                <td class="${status.includes("⚠️") ? "warning" : ""}">${status}</td>
            </tr>
        `;

        labels.push(`Контур ${i}`);
        flowRates.push(flowRate.toFixed(2));
        velocities.push(velocity.toFixed(3));
        statuses.push(status);
    }

    // Построение графика
    renderChart(labels, flowRates);
}

function renderChart(labels, data) {
    const ctx = document.getElementById("chart").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Расход (л/мин)",
                data: data,
                backgroundColor: "rgba(54, 162, 235, 0.7)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: "л/мин" }
                }
            }
        }
    });
}

// Инициализация при загрузке
window.onload = generateInputs;