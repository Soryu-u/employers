const { Pool } = require("pg");
const pool = new Pool({
  user: "szpaku",
  password: "Windranger123",
  host: "localhost",
  post: 5432,
  database: "incamp",
});

const monthName = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const currentMonth = new Date(new Date().toDateString()).getMonth();
const currentYear = new Date(new Date().toDateString()).getFullYear();

let horizonIndex = process.argv[2];

function formatMonth(date) {
  return new Date(date).getMonth();
}

function dayToString(date) {
  return new Date(date).toDateString().slice(8, 10);
}

function formatYear(date) {
  return new Date(date).getFullYear();
}

function plural(count) {
  let n = Math.abs(count);
  n %= 100;
  if (n >= 5 && n <= 20) {
    return `${count} лет`;
  }
  n %= 10;
  if (n === 1) {
    return `${count} год`;
  }
  if (n >= 2 && n <= 4) {
    return `${count} года`;
  }
  return `${count} лет`;
}

function groupByMonth(array) {
  return (birthdayDate = array.reduce(function (dateOfBirth, employers) {
    let employersMonth = formatMonth(employers.birth_date);

    if (dateOfBirth[employersMonth]) {
      dateOfBirth[employersMonth].push(employers);
    } else {
      dateOfBirth[employersMonth] = [employers];
    }
    return dateOfBirth;
  }, {}));
}

function outputData(data, index) {
  let horizon = currentMonth + Number(index) - 2;
  let month = 0;

  for (month; month <= horizon; month++) {
    if (month in groupByMonth(data)) {
      if (groupByMonth(data)[month])
        console.log(`${monthName[month]} ${currentYear}`);
      groupByMonth(data)[month].map((el) => {
        console.log(
          `(${dayToString(el.birth_date)}) - ${el.name} (${plural(
            currentYear - formatYear(el.birth_date)
          )})`
        );
      });
    } else {
      console.log(`${monthName[month]} ${currentYear}`);
      console.log("В этот месяц нет дней рождений :(");
    }
  }
}

if (0 < horizonIndex && horizonIndex <= 12) {
  pool.query(`select * from items`, (err, res) => {
    if (!err) {
      outputData(res.rows, horizonIndex);
    } else {
      console.log(err.message);
    }
    pool.end();
  });
} else {
  console.log("Последний параметр должен быть числом (1-12)!");
}
