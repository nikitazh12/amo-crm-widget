define(['jquery'], function ($) {
  var CustomWidget = function () {
    var self = this;

    this.callbacks = {
      render: function () {
        var settings = self.get_settings();

        var observer = new MutationObserver(function () {
          var $target = $('.card-fields__top-name-field');
          if ($target.length && $('.button-input.generate-doc').length === 0) {
            var $button = $('<button class="button-input generate-doc">Создать документ</button>');
            $target.after($button);

            $button.on('click', function () {
              var lead = AMOCRM.data.current_card;
              self.generateDocument(lead);
            });

            observer.disconnect();
          }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return true;
      },

      init: function () {
        return true;
      },

      settings: function () {
        return self.render({
          href: '/templates/settings.twig',
          base_path: self.params.path,
          load: function (template) {
            var $content = $(template.render({
              google_url: self.get_settings().google_url,
              secret: self.get_settings().secret
            }));

            return $content;
          }
        });
      },

      onSave: function () {
        var url = $('input[name="google_url"]').val();
        if (!url) {
          return false;
        }
        return {
          google_url: url
        };
      }
    };

    this.save_google_url = function (url) {
      if (!url) {
        AMOCRM.notifications.show_message({
          text: 'Введите URL Google Apps Script',
          type: 'error'
        });
        return;
      }

      AMOCRM.widgets.save({
        google_url: url
      }).then(function () {
        AMOCRM.notifications.show_message({
          text: 'URL успешно сохранен',
          type: 'success'
        });
      }).catch(function () {
        AMOCRM.notifications.show_message({
          text: 'Ошибка при сохранении URL',
          type: 'error'
        });
      });
    };

    this.generateDocument = function (lead) {
      var settings = self.get_settings();

      if (!settings.google_url) {
        AMOCRM.notifications.show_message({
          text: 'URL Google Apps Script не настроен',
          type: 'error'
        });
        return;
      }

      var $button = $('.button-input').text('Генерация...');

      var data = {
        lead_id: lead.id,
        lead_name: lead.name,
        company: lead.company ? lead.company.name : '',
        price: lead.price,
        responsible: lead.responsible_user_id,
        contact: lead.main_contact ? lead.main_contact.name : '',
        status: lead.status_id,
        created_at: lead.created_at
      };

      $.ajax({
        url: settings.google_url,
        method: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (response) {
          if (response.url) {
            window.open(response.url, '_blank');
            AMOCRM.notifications.show_message({
              text: 'Документ успешно создан',
              type: 'success'
            });
          } else {
            AMOCRM.notifications.show_message({
              text: 'Ошибка при создании документа: нет ссылки в ответе',
              type: 'error'
            });
          }
        },
        error: function (xhr, status, error) {
          AMOCRM.notifications.show_message({
            text: 'Ошибка при создании документа: ' + error,
            type: 'error'
          });
        },
        complete: function () {
          $button.text('Создать документ');
        }
      });
    };

    return this;
  };

  return CustomWidget;
});

//Подключение гугла и яндекса
define(['jquery'], function ($) {
  var CustomWidget = function () {
    var self = this;

    this.callbacks = {
      render: function () {
        var settings = self.get_settings();

        var observer = new MutationObserver(function () {
          var $target = $('.card-fields__top-name-field');
          if ($target.length && $('.button-input.generate-doc').length === 0) {
            var $buttonGoogle = $('<button class="button-input generate-doc">Создать документ в Google</button>');
            var $buttonYandex = $('<button class="button-input generate-doc-yandex">Создать документ в Яндекс</button>');
            $target.after($buttonYandex);
            $target.after($buttonGoogle);

            $buttonGoogle.on('click', function () {
              var lead = AMOCRM.data.current_card;
              self.generateDocumentGoogle(lead);
            });

            $buttonYandex.on('click', function () {
              var lead = AMOCRM.data.current_card;
              self.generateDocumentYandex(lead);
            });

            observer.disconnect();
          }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return true;
      },

      init: function () {
        return true;
      },

      settings: function () {
        return self.render({
          href: '/templates/settings.twig',
          base_path: self.params.path,
          load: function (template) {
            var $content = $(template.render({
              google_url: self.get_settings().google_url,
              yandex_url: self.get_settings().yandex_url,
              secret: self.get_settings().secret
            }));

            return $content;
          }
        });
      },

      onSave: function () {
        var googleUrl = $('input[name="google_url"]').val();
        var yandexUrl = $('input[name="yandex_url"]').val();

        if (!googleUrl && !yandexUrl) {
          return false;
        }

        return {
          google_url: googleUrl,
          yandex_url: yandexUrl
        };
      }
    };

    this.generateDocumentGoogle = function (lead) {
      var settings = self.get_settings();

      if (!settings.google_url) {
        AMOCRM.notifications.show_message({
          text: 'URL Google Apps Script не настроен',
          type: 'error'
        });
        return;
      }

      var $button = $('.button-input.generate-doc').text('Генерация...').prop('disabled', true);

      var data = {
        lead_id: lead.id,
        lead_name: lead.name,
        company: lead.company ? lead.company.name : '',
        price: lead.price,
        responsible: lead.responsible_user_id,
        contact: lead.main_contact ? lead.main_contact.name : '',
        status: lead.status_id,
        created_at: lead.created_at
      };

      $.ajax({
        url: settings.google_url,
        method: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (response) {
          if (response.url) {
            AMOCRM.notifications.show_message({
              text: 'Документ создан',
              type: 'success'
            });
            window.open(response.url, '_blank');
          } else {
            AMOCRM.notifications.show_message({
              text: 'Ошибка: нет ссылки в ответе',
              type: 'error'
            });
          }
        },
        error: function (xhr, status, error) {
          AMOCRM.notifications.show_message({
            text: 'Ошибка при создании: ' + error,
            type: 'error'
          });
        },
        complete: function () {
          $button.text('Создать документ в Google').prop('disabled', false);
        }
      });
    };

    this.generateDocumentYandex = function (lead) {
      // Заглушка для Яндекса
      AMOCRM.notifications.show_message({
        text: 'Функция создания документа в Яндекс ещё не реализована',
        type: 'info'
      });
    };

    this.get_settings = function () {
      return self.params.settings || {};
    };

    return this;
  };

  return CustomWidget;
});

