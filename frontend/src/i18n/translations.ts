import { Language } from '@/stores/languageStore';

export const translations: Record<Language, Record<string, string>> = {
    uz: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.customers': 'Customers',
        'nav.contracts': 'Contracts',
        'nav.products': 'Products',
        'nav.categories': 'Categories',
        'nav.users': 'Users',
        'nav.subscriptions': 'Subscriptions',

        // Buttons
        'btn.add': 'Qo\'shish',
        'btn.edit': 'O\'zgartirish',
        'btn.delete': 'O\'chirish',
        'btn.save': 'Saqlash',
        'btn.cancel': 'Bekor qilish',
        'btn.logout': 'Chiqish',
        'btn.create': 'Yaratish',

        // Messages
        'msg.loading': 'Yuklanmoqda...',
        'msg.noData': 'Ma\'lumot topilmadi',
        'msg.error': 'Xatolik yuz berdi',
        'msg.success': 'Muvaffaqiyatli',
        'msg.deleteConfirm': 'Rostlashtirish',
        'msg.deleteConfirmText': 'Siz ishonchingiz kommi?',

        // Fields
        'field.name': 'Nomi',
        'field.email': 'Email',
        'field.phone': 'Telefon',
        'field.role': 'Rol',
        'field.status': 'Status',
        'field.market': 'Market',
        'field.createdAt': 'Yaratilgan',

        // Dashboard
        'dashboard.title': 'Dashboard',
        'dashboard.totalCustomers': 'Jami Customers',
        'dashboard.totalContracts': 'Jami Contracts',
        'dashboard.totalRevenue': 'Jami Daromad',
        'dashboard.pendingPayments': 'Kutilayotgan To\'lovlar',

        // Auth
        'auth.login': 'Kirish',
        'auth.logout': 'Chiqish',
        'auth.email': 'Email',
        'auth.password': 'Parol',

        // Empty state
        'empty.title': 'Ma\'lumot topilmadi',
        'empty.description': 'Hozircha hech qanday ma\'lumot yo\'q',
    },

    en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.customers': 'Customers',
        'nav.contracts': 'Contracts',
        'nav.products': 'Products',
        'nav.categories': 'Categories',
        'nav.users': 'Users',
        'nav.subscriptions': 'Subscriptions',

        // Buttons
        'btn.add': 'Add',
        'btn.edit': 'Edit',
        'btn.delete': 'Delete',
        'btn.save': 'Save',
        'btn.cancel': 'Cancel',
        'btn.logout': 'Logout',
        'btn.create': 'Create',

        // Messages
        'msg.loading': 'Loading...',
        'msg.noData': 'No data found',
        'msg.error': 'An error occurred',
        'msg.success': 'Success',
        'msg.deleteConfirm': 'Confirm',
        'msg.deleteConfirmText': 'Are you sure?',

        // Fields
        'field.name': 'Name',
        'field.email': 'Email',
        'field.phone': 'Phone',
        'field.role': 'Role',
        'field.status': 'Status',
        'field.market': 'Market',
        'field.createdAt': 'Created At',

        // Dashboard
        'dashboard.title': 'Dashboard',
        'dashboard.totalCustomers': 'Total Customers',
        'dashboard.totalContracts': 'Total Contracts',
        'dashboard.totalRevenue': 'Total Revenue',
        'dashboard.pendingPayments': 'Pending Payments',

        // Auth
        'auth.login': 'Login',
        'auth.logout': 'Logout',
        'auth.email': 'Email',
        'auth.password': 'Password',

        // Empty state
        'empty.title': 'No data',
        'empty.description': 'There is no data available',
    },

    ru: {
        // Navigation
        'nav.dashboard': 'Панель',
        'nav.customers': 'Клиенты',
        'nav.contracts': 'Контракты',
        'nav.products': 'Товары',
        'nav.categories': 'Категории',
        'nav.users': 'Пользователи',
        'nav.subscriptions': 'Подписки',

        // Buttons
        'btn.add': 'Добавить',
        'btn.edit': 'Редактировать',
        'btn.delete': 'Удалить',
        'btn.save': 'Сохранить',
        'btn.cancel': 'Отмена',
        'btn.logout': 'Выход',
        'btn.create': 'Создать',

        // Messages
        'msg.loading': 'Загрузка...',
        'msg.noData': 'Данные не найдены',
        'msg.error': 'Произошла ошибка',
        'msg.success': 'Успешно',
        'msg.deleteConfirm': 'Подтверждение',
        'msg.deleteConfirmText': 'Вы уверены?',

        // Fields
        'field.name': 'Имя',
        'field.email': 'Email',
        'field.phone': 'Телефон',
        'field.role': 'Роль',
        'field.status': 'Статус',
        'field.market': 'Рынок',
        'field.createdAt': 'Дата создания',

        // Dashboard
        'dashboard.title': 'Панель',
        'dashboard.totalCustomers': 'Всего клиентов',
        'dashboard.totalContracts': 'Всего контрактов',
        'dashboard.totalRevenue': 'Общий доход',
        'dashboard.pendingPayments': 'Ожидающие платежи',

        // Auth
        'auth.login': 'Вход',
        'auth.logout': 'Выход',
        'auth.email': 'Email',
        'auth.password': 'Пароль',

        // Empty state
        'empty.title': 'Нет данных',
        'empty.description': 'Данные недоступны',
    },
};

/**
 * Get translated text
 */
export const t = (key: string, language: Language): string => {
    return translations[language]?.[key] || key;
};
