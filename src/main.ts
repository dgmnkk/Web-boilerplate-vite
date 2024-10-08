import './style.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Teacher } from './types';
import { Validation } from './types';
import { Chart, ArcElement, Tooltip, Legend, Title, PieController } from 'chart.js';
import _ from 'lodash';
import dayjs from 'dayjs';


Chart.register(ArcElement, Tooltip, Legend, Title, PieController);

const modal = document.getElementById('modal') as HTMLElement;
const openModalBtn = document.getElementById('add-teacher') as HTMLButtonElement;
const closeModalBtn = document.querySelector('.close-btn') as HTMLButtonElement;
const teacherModal = document.getElementById('teacherModal') as HTMLElement;
const closeTeacherModalBtn = document.querySelector('.close-btn-teacherModal') as HTMLButtonElement;

openModalBtn.addEventListener('click', openAddTeacherModal);
closeModalBtn.addEventListener('click', closeAddTeacherModal);
closeTeacherModalBtn.addEventListener('click', closeTeacherInfoModal);

const regionFilter = document.querySelector('#country-filter') as HTMLSelectElement;
const ageFilter = document.querySelector('#age-filter') as HTMLSelectElement;
const genderFilter = document.querySelector('#gender-filter') as HTMLSelectElement;
const photoOnlyFilter = document.querySelector('#photo-only') as HTMLInputElement;
const favoriteOnlyFilter = document.querySelector('#favorite-only') as HTMLInputElement;

regionFilter.addEventListener('change', applyFilters);
ageFilter.addEventListener('change', applyFilters);
genderFilter.addEventListener('change', applyFilters);
photoOnlyFilter.addEventListener('change', applyFilters);
favoriteOnlyFilter.addEventListener('change', applyFilters);


const container = document.querySelector('.top-teachers') as HTMLElement;
const favoritesContainer = document.querySelector('.scroll-items') as HTMLElement;
const leftScrollBtn = document.querySelector('.scroll-btn img[src="./images/left-scroll.png"]') as HTMLImageElement;
const rightScrollBtn = document.querySelector('.scroll-btn img[src="./images/right-scroll.png"]') as HTMLImageElement;

const courses = ['Mathematics', 'Physics', 'English', 'Computer Science', 'Dancing', 'Chess', 'Biology', 'Chemistry', 'Law', 'Art', 'Medicine', 'Statistics'];
const continents: Record<string, string[]> = {
  Europe: ['Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'United Kingdom'],
  Asia: ['Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China', 'Cyprus', 'Georgia', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan', 'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine', 'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkey', 'Turkmenistan', 'United Arab Emirates', 'Uzbekistan', 'Vietnam'],
  Australia: ['Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Zealand', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Vanuatu'],
  Africa: ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon', 'Central African Republic', 'Chad', 'Comoros', 'Congo, Democratic Republic of the', 'Congo, Republic of the', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'],
  'North America': ['Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba', 'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 'Haiti', 'Honduras', 'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'United States'],
  'South America': ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela']
};


let teachersList: Teacher[] = [];
let filteredTeachersList: Teacher[] = [];
let sortedTeachersList: Teacher[] = [];
let favoritesList: Teacher[] = [];
const rowsPerPage = 10;
let currentPage = 1;
let map: L.Map | null = null;
let isMapOpened = false;
let teacherPieChart: Chart<"pie", number[], string> | null = null;

async function fetchUsers(results: number = 50) {
  try {
    const response = await fetch(`https://randomuser.me/api/?results=${results}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

fetchUsers().then(users => {
  teachersList = formatUsers(users);
  filteredTeachersList = teachersList;
  sortedTeachersList = teachersList;
  favoritesList = teachersList.filter(teacher => teacher.favorite === true);

  renderTeachers(teachersList);
  renderFavorites();
  renderStatistics(currentPage);
  setupPagination();
}).catch(error => {
  console.error('Error:', error);
});

function renderTeachers(teachers: Teacher[]) {
  container.innerHTML = '';
  teachers.forEach((teacher, index) => {
    const initials = `${teacher.full_name.split(' ')[0][0]}${teacher.full_name.split(' ')[1][0]}`;
    const teacherCard = `
        <div class="teacher-card ${teacher.favorite ? 'favorite' : ''}" data-index="${index}">
            ${teacher.favorite ? "<img class='star-icon' src='./src/images/star.png'/>" : ''}
            ${teacher.picture_thumbnail || teacher.picture_large ?
        `<img class="teacher-card-photo" src="${teacher.picture_thumbnail || teacher.picture_large}" alt="Teacher">`
        : `<div class="teacher-card-photo initials">${initials}</div>`}
            <h3>${teacher.full_name}</h3>
            <p class="discipline-label">${teacher.course ? teacher.course : '-'}</p>
            <p class="country-label">${teacher.country ? teacher.country : '-'}</p>
        </div>`;
    container.innerHTML += teacherCard;

  });
  updateCardsListeners();
}

(document.querySelector('.load-more') as HTMLElement).addEventListener('click', () => {
  fetchUsers(10).then(users => {
    users = formatUsers(users);
    teachersList = [...teachersList, ...users];
    console.log(teachersList)
    filteredTeachersList = teachersList;
    sortedTeachersList = teachersList;
    favoritesList = teachersList.filter(teacher => teacher.favorite === true);

    renderTeachers(teachersList);
    renderFavorites();
    renderStatistics(currentPage);
    setupPagination();
  }).catch(error => {
    console.error('Error:', error);
  });
});


function renderFavorites() {
  favoritesContainer.innerHTML = '';
  favoritesList.forEach((teacher, index) => {
    const initials = `${teacher.full_name.split(' ')[0][0]}${teacher.full_name.split(' ')[1][0]}`;
    const teacherCard = `
        <div class="teacher-card ${teacher.favorite ? 'favorite' : ''}" data-index="${index}">
            ${teacher.picture_thumbnail || teacher.picture_large ?
        `<img class="teacher-card-photo" src="${teacher.picture_thumbnail || teacher.picture_large}" alt="Teacher">`
        : `<div class="teacher-card-photo initials">${initials}</div>`}
            <h3>${teacher.full_name}</h3>
            <p class="discipline-label">${teacher.course ? teacher.course : '-'}</p>
            <p class="country-label">${teacher.country ? teacher.country : '-'}</p>
        </div>`;
    favoritesContainer.innerHTML += teacherCard;
  });
  updateCardsListeners();
}

function applyFilters() {
  const filters = {
    continent: regionFilter.value !== 'Not Selected' ? regionFilter.value : null,
    age: ageFilter.value !== 'Not Selected' ? ageFilter.value : null,
    gender: genderFilter.value !== 'Not Selected' ? genderFilter.value.toLowerCase() : null,
    favorite: favoriteOnlyFilter.checked,
    photo: photoOnlyFilter.checked
  }
  filteredTeachersList = filterUsers(teachersList, filters);
  renderTeachers(filteredTeachersList);
  sortedTeachersList = filteredTeachersList;
  renderStatistics(currentPage);
  setupPagination();
}

document.querySelectorAll('.statistics th').forEach(header => {
  header.addEventListener('click', () => {
    const sortBy: string = header.getAttribute('id') || '';
    sortedTeachersList = sortUsers(filteredTeachersList, sortBy);
    renderStatistics(currentPage);
    renderPieChart(sortBy);
  });
});


function getCategoryData(teachersList: Teacher[], sortBy: string): { labels: string[], data: number[] } {
  const categoryCount: { [key: string]: number } = {};

  teachersList.forEach(teacher => {
    const categoryValue = teacher[sortBy as keyof Teacher] as string;
    if (categoryValue) {
      categoryCount[categoryValue] = (categoryCount[categoryValue] || 0) + 1;
    }
  });

  return {
    labels: Object.keys(categoryCount),
    data: Object.values(categoryCount)
  };
}


function renderPieChart(sortBy: string) {
  const canvas = document.getElementById('myChart') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  const chartCont = document.querySelector('.chartCont') as HTMLElement;
  chartCont.style.height ='600px';
  if (!ctx) return;

  const { labels, data } = getCategoryData(filteredTeachersList, sortBy);

  if (teacherPieChart) {
    teacherPieChart.destroy();
  }

  teacherPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `${sortBy}`
        }
      }
    }
  });
}

function renderStatistics(page: number) {
  const tbody = document.querySelector('.statistics tbody') as HTMLElement;
  tbody.innerHTML = '';

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageItems = sortedTeachersList.slice(start, end);

  pageItems.forEach(teacher => {
    const row = `
        <tr>
          <td>${teacher.full_name ? teacher.full_name : '-'}</td>
          <td>${teacher.course ? teacher.course : '-'}</td>
          <td>${teacher.age ? teacher.age : '-'}</td>
          <td>${teacher.gender ? teacher.gender : '-'}</td>
          <td>${teacher.country ? teacher.country : '-'}</td>
        </tr>`;
    tbody.innerHTML += row;
  });
}

function setupPagination() {
  const pagination = document.querySelector('.pagination') as HTMLElement;
  pagination.innerHTML = '';

  const totalPages = Math.ceil(sortedTeachersList.length / rowsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const pageLink = document.createElement('a');
    pageLink.textContent = i.toString();
    if (i === currentPage) {
      pageLink.classList.add('active');
    }
    pageLink.addEventListener('click', () => {
      currentPage = i;
      renderStatistics(currentPage);
      updatePagination();
    });
    pagination.appendChild(pageLink);
  }

  const lastPageLink = document.createElement('a');
  lastPageLink.textContent = 'Last';
  lastPageLink.addEventListener('click', () => {
    currentPage = totalPages;
    renderStatistics(currentPage);
    updatePagination();
  });
  pagination.appendChild(lastPageLink);
}


function updatePagination() {
  const paginationLinks = document.querySelectorAll('.pagination a');
  paginationLinks.forEach(link => link.classList.remove('active'));
  paginationLinks[currentPage - 1].classList.add('active');
}

(document.querySelector('#search-btn') as HTMLElement).addEventListener('click', () => {
  const searchTerm = (document.querySelector('#search-input') as HTMLInputElement).value.toLowerCase();
  if (_.isEmpty(searchTerm)) {
    filteredTeachersList = teachersList;
  } else {
    filteredTeachersList = _.filter(teachersList, user => 
      _.includes(_.toLower(user.full_name), searchTerm) ||
      (_.isString(user.note) && _.includes(_.toLower(user.note), searchTerm)) ||
      _.includes(String(user.age), searchTerm) ||
      _.includes(_.toLower(user.course), searchTerm)
    );
  }
  renderTeachers(filteredTeachersList);
  sortedTeachersList = filteredTeachersList;
  renderStatistics(currentPage);
  setupPagination();
});


(document.querySelector('.submit-btn') as HTMLElement).addEventListener('click', async (e) => {
  e.preventDefault();

  const formTeacher = {
    full_name: (document.querySelector('#name') as HTMLInputElement).value,
    course: (document.querySelector('#speciality') as HTMLInputElement).value,
    country: (document.querySelector('#country-modal') as HTMLInputElement).value,
    city: (document.querySelector('#city') as HTMLInputElement).value,
    email: (document.querySelector('#email') as HTMLInputElement).value,
    phone: (document.querySelector('#phone') as HTMLInputElement).value,
    gender: (document.querySelector('input[name="sex"]:checked') as HTMLInputElement).value,
    b_date: (document.querySelector('#dob') as HTMLInputElement).value,
    note: (document.querySelector('#notes') as HTMLInputElement).value,
    bg_color: (document.querySelector('#bgcolor') as HTMLInputElement).value,
  };

  const newTeacher: Teacher = {
    id: Math.random().toString(16).slice(2),
    gender: formTeacher.gender,
    title: formTeacher.gender.toLocaleLowerCase() == 'male' ? 'Mr' : 'Mrs',
    full_name: formTeacher.full_name,
    city: formTeacher.city,
    state: null,
    country: formTeacher.country,
    postcode: null,
    coordinates: null,
    timezone: null,
    email: formTeacher.email,
    b_date: formTeacher.b_date,
    age: null,
    phone: formTeacher.phone,
    picture_large: null,
    picture_thumbnail: null,
    favorite: false,
    course: formTeacher.course,
    bg_color: formTeacher.bg_color,
    note: formTeacher.note
  }
  const validation = validateUser(newTeacher);
  if (validation.valid) {
    try {
      await fetch('http://localhost:5000/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTeacher)
      });

      teachersList.push(newTeacher);
      renderTeachers(teachersList);
      renderStatistics(currentPage);
      setupPagination();
      closeAddTeacherModal();
    } catch (error) {
      console.error('Adding new teacher error:', error);
    }
  } else {
    alert('Errors: ' + validation.errors.join(', '));
  }
});


leftScrollBtn.addEventListener('click', () => {
  favoritesContainer.scrollBy({
    top: 0,
    left: -300,
    behavior: 'smooth'
  });
});

rightScrollBtn.addEventListener('click', () => {
  favoritesContainer.scrollBy({
    top: 0,
    left: 300,
    behavior: 'smooth'
  });
});

function closeAddTeacherModal() {
  modal.style.display = 'none';
}

function openAddTeacherModal() {
  modal.style.display = 'flex';
}

function closeTeacherInfoModal() {
  closeMap();
  teacherModal.style.display = 'none';
}

function closeMap() {
  const teacherMap = teacherModal.querySelector('#map') as HTMLElement;
  teacherMap.innerHTML = '';
  teacherMap.style.height = '0px';
  isMapOpened = false;
}

function daysUntilNextBirthday(b_date: string): number {
  const today = dayjs();
  const birthDate = dayjs(b_date);

  const nextBirthday = birthDate.year(today.year());

  if (nextBirthday.isBefore(today)) {
    return nextBirthday.add(1, 'year').diff(today, 'day');
  } else {
    return nextBirthday.diff(today, 'day');
  }
}

function openTeacherInfoModal(teacher: Teacher) {
  const teacherModal = document.getElementById('teacherModal') as HTMLElement;
  const teacherPhoto = teacherModal.querySelector('.teacher-photo') as HTMLImageElement;
  const teacherName = teacherModal.querySelector('.teacher-details h2') as HTMLHeadingElement;
  const teacherSpeciality = teacherModal.querySelector('.teacher-details .speciality') as HTMLElement;
  const teacherLocation = teacherModal.querySelector('.teacher-details p:nth-child(3)') as HTMLParagraphElement;
  const teacherAgeGender = teacherModal.querySelector('.teacher-details p:nth-child(4)') as HTMLParagraphElement;
  const teacherEmail = teacherModal.querySelector('.teacher-details a') as HTMLAnchorElement;
  const teacherPhone = teacherModal.querySelector('.teacher-details p:nth-child(6)') as HTMLParagraphElement;
  const teacherDescription = teacherModal.querySelector('.teacher-description') as HTMLElement;
  const toggleMapBtn = teacherModal.querySelector('.toggle-map') as HTMLElement;
  const teacherBirthday = teacherModal.querySelector('.teacher-details .birthday') as HTMLElement;

  const daysUntilBirthday = teacher.b_date ? daysUntilNextBirthday(teacher.b_date) : 'N/A';
  teacherBirthday.textContent = `Days until next birthday: ${daysUntilBirthday}`;

  let addToFavoriteBtn = document.querySelector('.modal-title img') as HTMLImageElement;
  let isFavorite = favoritesList.some(favTeacher => favTeacher.id === teacher.id);

  teacherPhoto.src = teacher.picture_large || "./src/images/no-teacher-photo.png";
  teacherName.textContent = teacher.full_name;
  teacherSpeciality.textContent = teacher.course || 'Unknown';
  teacherLocation.textContent = `${teacher.city}, ${teacher.country}`;
  teacherAgeGender.textContent = `${teacher.age}, ${teacher.gender.charAt(0).toUpperCase() + teacher.gender.slice(1)}`;
  teacherEmail.textContent = teacher.email;
  teacherEmail.href = `mailto:${teacher.email}`;
  teacherPhone.textContent = teacher.phone;
  teacherDescription.textContent = teacher.note || 'No additional information';
  toggleMapBtn.addEventListener('click', () => {
    if (!isMapOpened) {
      setTimeout(() => {
        initializeMap(teacher.coordinates, teacher.full_name);
      }, 300);
    } else {
      setTimeout(() => {
        closeMap();
      }, 300);
    }
  });

  addToFavoriteBtn.src = isFavorite ? './src/images/star.png' : './src/images/star-default.png';
  addToFavoriteBtn.onclick = () => {
    if (isFavorite) {
      favoritesList = favoritesList.filter(favTeacher => favTeacher.id !== teacher.id);
      addToFavoriteBtn.src = './src/images/star-default.png';
    } else {
      favoritesList.push(teacher);
      addToFavoriteBtn.src = './src/images/star.png';
    }
    isFavorite = !isFavorite;
    renderFavorites();
    const teacherIndex = teachersList.findIndex(x => x.id === teacher.id);
    if (teacherIndex !== -1) {
      teachersList[teacherIndex].favorite = isFavorite;
    }
    renderTeachers(teachersList);
  };

  teacherModal.style.display = 'flex';
}

function initializeMap(coordinates: any, name: string) {
  const mapContainer = document.getElementById('map');

  if (mapContainer) {
    if (map !== null) {
      map.remove();
    }
    mapContainer.style['height'] = '300px';
    map = L.map(mapContainer).setView([coordinates.latitude, coordinates.longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([coordinates.latitude, coordinates.longitude]).addTo(map)
      .bindPopup(`${name}`)
      .openPopup();

  }

  isMapOpened = true;
}

function updateCardsListeners() {
  const teachersCards = document.querySelectorAll('.teacher-card');
  teachersCards.forEach(card => {
    const index: number = Number(card.getAttribute('data-index'));
    const isFavorite = card.closest('.scroll-items') ? true : false;
    card.addEventListener('click', () => {
      if (isFavorite) {
        openTeacherInfoModal(favoritesList[index]);
      } else {
        openTeacherInfoModal(filteredTeachersList[index]);
      }
    });
  });
}

function isWithinAgeRange(age: number, range: String) {
  const [min, max] = range.split('-').map(Number);
  return age >= min && age <= max;
}


// Methods from lab2
function formatUsers(users: any[]) {
  return users.map(user => ({
    id: _.get(user, 'id.name') && _.get(user, 'id.value')
      ? `${_.get(user, 'id.name')}${_.get(user, 'id.value')}`
      : _.random(0, 1e16).toString(16),
    gender: _.get(user, 'gender', null),
    title: _.get(user, 'title', _.get(user, 'name.title', null)),
    full_name: _.get(user, 'full_name', `${_.get(user, 'name.first', '')} ${_.get(user, 'name.last', '')}`),
    city: _.get(user, 'city', _.get(user, 'location.city', null)),
    state: _.get(user, 'state', _.get(user, 'location.state', null)),
    country: _.get(user, 'country', _.get(user, 'location.country', null)),
    postcode: _.get(user, 'postcode', _.get(user, 'location.postcode', null)),
    coordinates: _.get(user, 'coordinates', _.get(user, 'location.coordinates', null)),
    timezone: _.get(user, 'timezone', _.get(user, 'location.timezone', null)),
    email: _.get(user, 'email', null),
    b_date: _.get(user, 'b_date', _.get(user, 'dob.date', null)),
    age: _.get(user, 'age', _.get(user, 'dob.age', null)),
    phone: _.get(user, 'phone', _.get(user, 'cell', null)),
    picture_large: _.get(user, 'picture_large', _.get(user, 'picture.large', null)),
    picture_thumbnail: _.get(user, 'picture_thumbnail', _.get(user, 'picture.thumbnail', null)),
    favorite: _.get(user, 'favorite', false),
    course: _.get(user, 'course', _.sample(courses)),
    bg_color: _.get(user, 'bg_color', `#${_.random(0, 0xFFFFFF).toString(16)}`),
    note: _.get(user, 'note', null)
  }));
}



function validateUser(user: any): Validation {
  const errors: string[] = [];

  if (!_.isString(user.full_name) || !_.startsWith(user.full_name, _.upperFirst(user.full_name))) {
    errors.push("Invalid name format");
  }

  if (!_.isString(user.gender) || !_.startsWith(user.gender, _.upperFirst(user.gender))) {
    errors.push("Invalid gender format");
  }

  if (!_.isString(user.note) || !_.startsWith(user.note, _.upperFirst(user.note))) {
    errors.push("Invalid note format");
  }

  if (!_.isString(user.city) || !_.startsWith(user.city, _.upperFirst(user.city))) {
    errors.push("Invalid city format");
  }

  if (!_.isString(user.country) || !_.startsWith(user.country, _.upperFirst(user.country))) {
    errors.push("Invalid country format");
  }

  if (!/^[\d\s+\-()]+$/.test(user.phone)) {
    errors.push('Invalid phone format');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push('Invalid email format');
  }

  return errors.length ? { valid: false, errors } : { valid: true, errors };
}

function filterUsers(users: any[], filters: any) {
  return _.filter(users, user => {
    return (!filters.continent || _.includes(continents[filters.continent], user.country)) &&
      (!filters.age || isWithinAgeRange(user.age, filters.age)) &&
      (!filters.gender || _.toLower(user.gender) === _.toLower(filters.gender)) &&
      (!filters.favorite || user.favorite === filters.favorite) &&
      (!filters.photo || (user.picture_thumbnail && user.picture_large));
  });
}

function sortUsers(users: any[], sortBy: string) {
  const usersCopy = users.slice();
  return _.orderBy(usersCopy, [sortBy]);
}