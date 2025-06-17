define(['jquery'], function ($) {
  var CustomWidget = function () {
    var self = this;
    
    this.callbacks = {
      render: function() {
        // Добавляем кнопку только на странице сделки
        if (AMOCRM.data.current_entity === 'leads') {
          // Получаем настройки виджета
          var settings = self.get_settings();
          
          // Добавляем кнопку
          var $button = $('<button class="button-input">Создать документ</button>');
          $('.card-fields__top-name-field').after($button);
          
          // Обработчик клика
          $button.on('click', function() {
            var lead = AMOCRM.data.current_card;
            self.generateDocument(lead);
          });
        }
        return true;
      },
      
      init: function() {
        return true;
      },
      
      settings: function() {
        return self.render({
          href: '/templates/settings.twig',
          base_path: self.params.path,
          load: function(template) {
            var $content = $(template.render({
              google_url: self.get_settings().google_url,
              secret: self.get_settings().secret
            }));

            $content.find('#save_url').on('click', function() {
              var url = $content.find('input[name="google_url"]').val();
              self.save_settings({google_url: url});
            });

            return $content;
          }
        });
      },
      
      onSave: function() {
        var url = $('input[name="google_url"]').val();
        if (!url) {
          return false;  
        }
        return {
          google_url: url
        };
      }
    };

    // Добавляем метод сохранения URL
    this.save_google_url = function(url) {
      if (!url) {
        AMOCRM.notifications.show_message({
          text: 'Введите URL Google Apps Script',
          type: 'error'
        });
        return;
      }

      AMOCRM.widgets.save({
        google_url: url
      }).then(function() {
        AMOCRM.notifications.show_message({
          text: 'URL успешно сохранен',
          type: 'success'
        });
      }).catch(function() {
        AMOCRM.notifications.show_message({
          text: 'Ошибка при сохранении URL',
          type: 'error'
        });
      });
    };

    this.generateDocument = function(lead) {
      var settings = self.get_settings();
      
      if (!settings.google_url) {
        AMOCRM.notifications.show_message({
          text: 'URL Google Apps Script не настроен',
          type: 'error'
        });
        return;
      }
      
      // Показываем индикатор загрузки
      var $button = $('.button-input').text('Генерация...');
      
      // Собираем данные для документа
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

      // Отправляем запрос в Google Apps Script
      $.ajax({
        url: settings.google_url,
        method: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(response) {
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
        error: function(xhr, status, error) {
          AMOCRM.notifications.show_message({
            text: 'Ошибка при создании документа: ' + error,
            type: 'error'
          });
        },
        complete: function() {
          $button.text('Создать документ');
        }
      });
    };

    return this;
  };

  return CustomWidget;
});
