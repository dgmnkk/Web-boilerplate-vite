import './style.css';

interface Teacher {
  id: string;
  full_name: string;
  course: string;
  country: string;
  city: string;
  email: string;
  phone: string;
  gender: string;
  b_date: string;
  note: string | null;
  favorite: boolean;
  picture_large: string | null;
  picture_thumbnail: string | null;
  age: number | null;
  bg_color: string;
}

interface Validation{
  valid: boolean;
  errors: string[];
}
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
    const sortBy : string = header.getAttribute('id') || '';
    sortedTeachersList = sortUsers(filteredTeachersList, sortBy);
    renderStatistics(currentPage);
  });
});


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
  if (searchTerm == '') {
    filteredTeachersList = teachersList;
  } else {
    filteredTeachersList = teachersList.filter(user =>
      user.full_name.toLowerCase().includes(searchTerm) ||
      (user.note && user.note.toLowerCase().includes(searchTerm)) ||
      String(user.age).includes(searchTerm) ||
      user.course.toLowerCase().includes(searchTerm)
    );
  }
  renderTeachers(filteredTeachersList);
  sortedTeachersList = filteredTeachersList;
  renderStatistics(currentPage);
  setupPagination();
});


(document.querySelector('.submit-btn') as HTMLElement).addEventListener('click', async (e) => {
  e.preventDefault();

  const newUser = {
    full_name: (document.querySelector('#name') as HTMLInputElement).value,
    course: (document.querySelector('#speciality') as HTMLInputElement).value,
    country: (document.querySelector('#country-modal') as HTMLInputElement).value,
    city: (document.querySelector('#city') as HTMLInputElement).value,
    email: (document.querySelector('#email') as HTMLInputElement).value,
    phone: (document.querySelector('#phone') as HTMLInputElement).value,
    gender: (document.querySelector('input[name="sex"]:checked') as HTMLInputElement).value,
    b_date: (document.querySelector('#dob') as HTMLInputElement).value,
    note: (document.querySelector('#notes') as HTMLInputElement).value,
    favorite: false,
    bg_color: (document.querySelector('#bgcolor') as HTMLInputElement).value,
  };

  const validation = validateUser(newUser);
  if (validation.valid) {
    try {
      const response = await fetch('http://localhost:5000/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      const newTeacher = await response.json();
      console.log('New teacher:', newTeacher);

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
  teacherModal.style.display = 'none';
}


function openTeacherInfoModal(teacher : Teacher) {
  const teacherModal = document.getElementById('teacherModal') as HTMLElement;
  const teacherPhoto = teacherModal.querySelector('.teacher-photo') as HTMLImageElement;
  const teacherName = teacherModal.querySelector('.teacher-details h2') as HTMLHeadingElement;
  const teacherSpeciality = teacherModal.querySelector('.teacher-details .speciality') as HTMLElement;
  const teacherLocation = teacherModal.querySelector('.teacher-details p:nth-child(3)') as HTMLParagraphElement;
  const teacherAgeGender = teacherModal.querySelector('.teacher-details p:nth-child(4)') as HTMLParagraphElement;
  const teacherEmail = teacherModal.querySelector('.teacher-details a') as HTMLAnchorElement;
  const teacherPhone = teacherModal.querySelector('.teacher-details p:nth-child(6)') as HTMLParagraphElement;
  const teacherDescription = teacherModal.querySelector('.teacher-description') as HTMLElement;
  
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
  return users.map(user => {
    return {
      id: (user.id && user.id.name && user.id.value) ? `${user.id.name}${user.id.value}` : Math.random().toString(16).slice(2) || (user.id ? user.id : Math.random().toString(16).slice(2)),
      gender: user.gender || null,
      title: user.title || (user.name && user.name.title) || null,
      full_name: user.full_name || (user.name ? `${user.name.first} ${user.name.last}` : null),
      city: user.city || (user.location && user.location.city) || null,
      state: user.state || (user.location && user.location.state) || null,
      country: user.country || (user.location && user.location.country) || null,
      postcode: user.postcode || (user.location && user.location.postcode) || null,
      coordinates: user.coordinates || (user.location && user.location.coordinates) || null,
      timezone: user.timezone || (user.location && user.location.timezone) || null,
      email: user.email || null,
      b_date: user.b_day || (user.dob && user.dob.date) || null,
      age: user.age || (user.dob && user.dob.age) || null,
      phone: user.phone || user.cell || null,
      picture_large: user.picture_large || (user.picture && user.picture.large) || null,
      picture_thumbnail: user.picture_thumbnail || (user.picture && user.picture.thumbnail) || null,
      favorite: user.favorite || false,
      course: user.course || courses[Math.floor(Math.random() * courses.length)],
      bg_color: user.bg_color || '#' + (Math.random() * 0xFFFFFF << 0).toString(16),
      note: user.note || null
    };
  });
}



function validateUser(user: any) : Validation{
  const errors = [];
  if (typeof user.full_name !== 'string' || user.full_name.charAt(0) !== user.full_name.charAt(0).toUpperCase()) {
    errors.push("Invalid name format");
  }

  if (typeof user.gender !== 'string' || user.gender.charAt(0) !== user.gender.charAt(0).toUpperCase()) {
    errors.push("Invalid gender format");
  }

  if (typeof user.note !== 'string' || user.note.charAt(0) !== user.note.charAt(0).toUpperCase()) {
    errors.push("Invalid note format");
  }

  if (typeof user.city !== 'string' || user.city.charAt(0) !== user.city.charAt(0).toUpperCase()) {
    errors.push("Invalid city format");
  }

  if (typeof user.country !== 'string' || user.country.charAt(0) !== user.country.charAt(0).toUpperCase()) {
    errors.push("Invalid country format");
  }

  const phoneRegex = /^[\d\s+\-()]+$/;
  if (!phoneRegex.test(user.phone)) {
    errors.push('Invalid phone format');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user.email)) {
    errors.push('Invalid email format');
  }

  return errors.length ? { valid: false, errors } : { valid: true, errors };
}

function filterUsers(users: any[], filters: any) {
  return users.filter(user => {
    return (filters.continent ? continents[filters.continent].includes(user.country) : true) &&
      (filters.age ? isWithinAgeRange(user.age, filters.age) : true) &&
      (filters.gender ? user.gender && user.gender.toLowerCase() == filters.gender.toLowerCase() : true) &&
      (filters.favorite ? user.favorite && user.favorite == filters.favorite : true) &&
      (filters.photo ? user.picture_thumbnail != null && user.picture_large != null : true);
  });
}

function sortUsers(users: any[], sortBy : string, order = 'asc') {
  const usersCopy = users.slice();
  return usersCopy.sort((a, b) => {
    let valueA : any= a[sortBy];
    let valueB : any= b[sortBy];

    if ((typeof valueA === 'number' || valueA instanceof Date) &&
      (typeof valueB === 'number' || valueB instanceof Date)) {

      return order === 'asc' ? +valueA - +valueB : +valueB - +valueA;
    }

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
      if (valueA < valueB) {
        return order === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    }

    return 0;
  });
}

function findUser(users: any[], key: number, value: any) : any[] {
  return users.find(user => user[key] === value);
}
