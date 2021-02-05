const Modal = {
    toggle(event) {
        if (event.target.classList[0] === 'modal-overlay' || event.target.classList[1] === 'cancel' || event.type == 'submit') {
            document.querySelector('.modal-overlay').classList.remove('active')
            App.reload()
        } else {
            document.querySelector('.modal-overlay').classList.add('active')
        }
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },
    set(transactions) {
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        this.all.push(transaction)
    },

    remove(index) {
        this.all.splice(index, 1)
        App.reload()
    },

    incomes() {
        let income = 0
        // Catch all transactions
        // For each transaction
        this.all.forEach(transaction => {
            // If greater than zero we add to the variable
            transaction.amount > 0 ? income += transaction.amount : income += 0
        })
        return income
    },

    expenses() {
        let expense = 0
        this.all.forEach(transaction => {
            transaction.amount < 0 ? expense += transaction.amount : expense += 0
        })
        return expense
    },

    total() {
        return total = this.incomes() + this.expenses() // Here we use + because if we use - the expense will turn into a positive value
    }
}

// Get transactions from js an put on html
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    innerHTMLTransaction(transaction, index) {
        const cssClass = transaction.amount > 0 ? 'income' : 'expense'

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${cssClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img src="assets/minus.svg" alt="Remover transação" onclick='Transaction.remove(${index})'>
            </td>
        `

        return html
    },
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },
    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions() {
        this.transactionsContainer.innerHTML = ''
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g, '')

        value = Number(value) / 100

        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })

        return signal + value
    },

    formatAmount(value) {
        value = Number(value) * 100
        return value
    },

    formatDate(date) {
        const splittedDate = date.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value
        }
    },

    validateFields() {
        const {
            description,
            amount,
            date
        } = this.getValues()

        if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
            throw new Error('Por favor, preencha todos os campos')
        }
    },

    formatValues() {
        let {
            description,
            amount,
            date
        } = this.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        Form.description.value = ''
        Form.amount.value = ''
        Form.date.value = ''
    },

    submit(event) {
        event.preventDefault()
        try {
            // verify if all information has been completed
            Form.validateFields()
            // Format the data to save
            const transaction = Form.formatValues()
            // Save
            Form.saveTransaction(transaction)
            // Clear form data
            Form.clearFields()
            // Close modal
            Modal.toggle(event)
        } catch (error) {
            document.querySelector('.input-group.error').innerHTML = `${error.message}`
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()
        Storage.set(Transaction.all)
    },
    reload() {
        document.querySelector('.input-group.error').innerHTML = ``
        DOM.clearTransactions()
        this.init()
    }
}

App.init()

// Events listeners
document.querySelector('.new').addEventListener('click', Modal.toggle)
document.querySelector('.modal-overlay').addEventListener('click', Modal.toggle)
document.querySelector('.cancel').addEventListener('click', Modal.toggle)
document.querySelector('form').addEventListener('submit', Form.submit)