class Contact {
	constructor(data) {
		this.data = data;
	}

	edit(data) {
		this.data = { ...this.data, ...data };
	}

	get() {
		return this.data;
	}
}

class Contacts {
	constructor() {
		this.contactsList = [];
	}

	add(data) {
		if (data.userName.length === 0 || data.userMail.length === 0) return;
		const contact = new Contact(data);
		if (!data.id) {
			const id = Date.now();
			contact.edit({ id });
		}
		this.contactsList.push(contact);
	}

	edit(id, data) {
		const contact = this.contactsList.find(contact => contact.data.id === id);
		contact.edit(data);
	}

	remove(id) {
		this.contactsList = this.contactsList.filter(
			contact => contact.data.id !== id
		);
	}

	set store(contacts) {
		const data = JSON.stringify(contacts);
		localStorage.setItem('contacts', data);
	}

	get store() {
		const data = localStorage.getItem('contacts');
		return JSON.parse(data);
	}

	clearStore() {
		localStorage.removeItem('contacts');
	}

	setCookie(maxAge) {
		const options = {
			path: '/',
			'max-age': maxAge,
		};

		if (options.expires instanceof Date) {
			options.expires = options.expires.toUTCString();
		}

		let updatedCookie =
			encodeURIComponent('contacts') + '=' + encodeURIComponent('');

		for (let optionKey in options) {
			updatedCookie += '; ' + optionKey;
			let optionValue = options[optionKey];
			if (optionValue !== true) {
				updatedCookie += '=' + optionValue;
			}
		}

		document.cookie = updatedCookie;
	}

	getCookie() {
		const name = 'contacts';
		let matches = document.cookie.match(
			new RegExp(
				'(?:^|; )' +
					name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') +
					'=([^;]*)'
			)
		);
		return matches ? true : false;
	}

	async getApiData() {
		const url = 'https://jsonplaceholder.typicode.com/users';
		let response = await fetch(url);
		let data = await response.json();
		const newData = [];
		data.forEach(user => {
			const newUser = {
				id: user.id,
				userName: user.username,
				userMail: user.email,
				userPhone: user.phone,
				userAddress: user.address.city,
			};
			newData.push(newUser);
		});
		return newData;
	}

	get() {
		return this.contactsList;
	}
}

const contacts = new Contacts();

class ContactsApp extends Contacts {
	constructor(selector) {
		super();
		this.container = document.querySelector(selector);
		this.contactsContainer = document.createElement('div');
		this.init();
	}

	async init() {
		const form = document.createElement('form');
		const userName = document.createElement('input');
		userName.setAttribute('type', 'text');
		userName.setAttribute('placeholder', 'Enter your name here...');
		const userMail = document.createElement('input');
		userMail.setAttribute('type', 'email');
		userMail.setAttribute('placeholder', 'Your E-mail...');
		const userPhone = document.createElement('input');
		userPhone.setAttribute('type', 'tel');
		userPhone.setAttribute('placeholder', 'Your phone number...');
		const userAddress = document.createElement('input');
		userAddress.setAttribute('type', 'text');
		userAddress.setAttribute('placeholder', 'Your address...');
		const submit = document.createElement('button');
		submit.setAttribute('type', 'submit');
		submit.innerHTML = 'Add Contact';
		form.append(userName, userMail, userPhone, userAddress, submit);

		form.addEventListener('submit', event => {
			event.preventDefault();
			const data = {
				userName: userName.value,
				userMail: userMail.value,
				userPhone: userPhone.value,
				userAddress: userAddress.value,
			};
			this.add(data);
			this.store = this.contactsList;
			this.setCookie(864000);
			this.render();
			console.log(this);
		});
		this.contactsContainer.classList.add('contacts');
		this.container.append(form, this.contactsContainer);

		if (this.store.length !== 0) {
			this.store.forEach(contact => this.add(contact.data));
		} else if (this.store.length === 0) {
			const newData = await this.getApiData();
			newData.forEach(contact => this.add(contact));
		}

		console.log(this.store.length);

		if (!this.getCookie()) {
			this.clearStore();
		}

		this.render();
	}

	render() {
		if (this.contactsList.length === 0) {
			this.contactsContainer.innerHTML = `<h2>Список контактов пуст</h2>`;
			return;
		}

		this.contactsContainer.innerHTML = '';

		this.contactsList.forEach(contact => {
			const contactItem = document.createElement('div');
			let flag = false;
			contactItem.classList.add('item');

			const nameContainer = document.createElement('div');
			nameContainer.innerHTML = `
					<h3>User Name</h3>
					<p>${contact.data.userName}</p>
					`;

			const mailContainer = document.createElement('div');
			mailContainer.innerHTML = `
					<h3>E-mail</h3>
					<p>${contact.data.userMail}</p>
					`;

			const phoneContainer = document.createElement('div');
			phoneContainer.innerHTML = `
					<h3>Phone number</h3>
					<p>${contact.data.userPhone}</p>
					`;

			const addressContainer = document.createElement('div');
			addressContainer.innerHTML = `
					<h3>Address</h3>
					<p>${contact.data.userAddress}</p>
					`;

			const content = document.createElement('div');
			content.classList.add('contactContent');
			content.append(
				nameContainer,
				mailContainer,
				phoneContainer,
				addressContainer
			);

			const buttons = document.createElement('div');
			buttons.classList.add('controlButtons');

			const remove = document.createElement('button');
			remove.classList.add('remove');
			const edit = document.createElement('button');
			edit.classList.add('edit');
			remove.innerHTML = 'Remove';
			edit.innerHTML = 'Edit';

			buttons.append(edit, remove);

			remove.addEventListener('click', () => {
				this.remove(contact.data.id);
				this.render();
				this.store = this.contactsList;
			});

			edit.addEventListener('click', () => {
				if (flag) {
					edit.innerHTML = 'Edit';
					userName.contentEditable = false;
					userMail.contentEditable = false;
					const data = {
						userName: userName.innerText,
						userMail: userMail.innerText,
						userPhone: userPhone.innerText,
						userAddress: userAddress.innerText,
					};
					this.edit(contact.data.id, data);
					this.store = this.contactsList;
					this.render();
					flag = !flag;
				} else {
					edit.innerHTML = 'Save';
					userName.contentEditable = true;
					userMail.contentEditable = true;
					userAddress.contentEditable = true;
					userPhone.contentEditable = true;
					flag = !flag;
				}
			});

			contactItem.append(content, buttons);
			this.contactsContainer.append(contactItem);
		});
	}
}

new ContactsApp('#root');
