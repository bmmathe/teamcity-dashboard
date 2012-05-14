function MetroGrid()
{
}

MetroGrid.prototype = {
  init: function ($grid)
  {
    this.$grid = $grid;

    // dummy group for space
    this.layout();

    $(window).bind('resize', this.layout.bind(this));
  },

  animate: function ()
  {
    var $items = Math.random() < .5
      ? this.$grid.find('.item.failing')
      : this.$grid.find('.item.successful');
    var $item = $($items[Math.floor(Math.random() * $items.length)]);

    //$item = $($('.item')[2]);

    this.animateStep($item).done(function (schedule)
    {
      if (schedule)
        setTimeout(this.animateStep.bind(this, $item), (Math.random() * 2 + 2) * 1000);
    }.bind(this));

    setTimeout(this.animate.bind(this), (Math.random() * 4 + 4) * 1000);
  },

  animateStep: function ($item)
  {
    return $.Deferred(function (dfd)
      {
        var step = $item.data('step') || 0;

        if (step < 0) return;
        $item.data('step', -1);

        if (step == 0)
        {
          $itemText = $item.find('.item-text');
          var mtop = $itemText.position()
            ? $item.height() - $itemText.position().top - $itemText.height() - 10
            : 0;
          $item.find('.extra-text')
            .css({ marginTop: mtop })
            .show();

          step = 1;
        }

        if (step == 1)
        {
          var $images = $item.find('.item-images img');

          if (!$item.hasClass('failing') || $images.length < 2)
            step = 3;
          else
          {
            var fst = Math.floor(Math.random() * $images.length);
            var snd = (fst + 1) % $images.length;

            var $fst = $($images[fst]);
            var $snd = $($images[snd]);

            $fst.animate({ opacity: 0, }, 'slow', function ()
              {
                $snd.animate({ opacity: 0, }, 'slow', function ()
                {
                  $fst.swap($snd);

                  $snd.animate({ opacity: 1, }, 'slow', function ()
                  {
                    $fst.animate({ opacity: 1, }, 'slow', function ()
                    {
                      setTimeout(function ()
                      {
                        $item.data('step', 3);
                        dfd.resolve();
                      }, 1000);
                    });
                  });
                });
              });
          }
        }

        if (step == 2)
        {
          if (!$item.hasClass('failing'))
            step = 3;
        }

        if (step == 3)
        {
          $item.children()
            .animate({ top: -($item.hasClass('failing') ? 125 : 90) }, 'slow', function ()
            {
              setTimeout(function ()
              {
                $item.data('step', 4);
                dfd.resolve(true);
              }.bind(this), 1000);
            }.bind(this));
        }

        if (step == 4)
        {
          $item.children()
            .animate({ top: 0 }, 'slow', function ()
            {
              setTimeout(function ()
              {
                $item.data('step', 1);
                dfd.resolve();
              }.bind(this), 1000);
            }.bind(this));
        }
      }.bind(this)).promise();
  },

  layout: function ()
  {
    this.animateableItems = [];

    var gridHeight = this.$grid.outerHeight() - 40; // 40 for group title

    this.$grid.find('.group').hide();
    var $groups = this.$grid.find('.group').has('.item')
    $groups
      .show()
      .css( { position: 'absolute' })
    var totalCols = 0;
    var groupCos;

    $.each($groups, function (i, group)
    {
      groupCols = 0;
      var $group = $(group);
      var $items = $group.find('.item');

      $group.find('.group-column').remove(); // from previous layout

      function mkColumn()
      {
        var $c = $('<div class=group-column>');
        $c.width(260);
        $group.find('.column-container').append($c);
        return $c;
      }

      var top = 0;
      var nrHalfs = 0;
      var fstHalf = false;
      var sndHalf = false;
      var $column = mkColumn();

      $.each($items, function (_, item)
      {
        var $item = $(item);
        var height = Math.ceil($item.height() / 100) * 100 - 10;
        $item.height(height)

        // Try to make half width
        if ($item.hasClass('successful'))
        {
          $item.width(120);
          var overflows = $item.find('.item-text p')[0].scrollWidth > $item.find('.item-text p')[0].clientWidth;

          var wontFit = overflows || $item.find('.item-text').outerHeight() > height;

          if (wontFit || nrHalfs == 4)
          {
            $item.width(250);
            fstHalf = false;
            sndHalf = false;
            nrHalfs = 0;
          }
          else if (fstHalf)
          {
            fstHalf = false;
            sndHalf = true;
            nrHalfs++;
          }
          else
          {
            fstHalf = true;
            sndHalf = false;
            nrHalfs++;
          }
        }

        if (top + (sndHalf ? 0 : height) > gridHeight)
        {
          groupCols++;
          top = 0;
          $column = mkColumn();
          $column.css({ left: groupCols * 260 });
        }

        if (!sndHalf)
          top += height + 10; // margin-bottom

        $column.append($item);
      });

      groupCols++;
      $group
        .css({ left: totalCols * 260 + i * 80 })
      totalCols += groupCols;
    });
  }
};

if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP
                                 ? this
                                 : oThis || window,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

jQuery.fn.swap = function(b) {
    b = jQuery(b)[0];
    var a = this[0];

    var t = a.parentNode.insertBefore(document.createTextNode(""), a);
    b.parentNode.insertBefore(a, b);
    t.parentNode.insertBefore(b, t);
    t.parentNode.removeChild(t);

    return this;
};
