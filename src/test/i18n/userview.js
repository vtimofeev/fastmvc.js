module.exports = {
    ru: {
        title: 'Карточка пользователя',
        username: 'Завут пацанчика/у {VALUE}',
        age: 'Уже {VALUE} стукнуло',
        balance: 'На текущий момент у него/нее {VALUE} бабосов',
        template: 'Какой то щаблон без всего',
        template2: 'Шаблон RU. Юзеру {AGE, plural, one {# год} few {# года} many {# лет} other {# лет}} , {FIRST} - FIRST',
        i18nFunc: function() {
            return 'test';
        }

    },
    en: {
      title: 'The user card',
      username: 'His/her name is {VALUE}',
      age: 'She/he is {VALUE} ages',
      balance: 'She/he has {VALUE, plural, one {# ruble} other {# rubles}'
    }
};

