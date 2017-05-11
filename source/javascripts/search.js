// lunr.js full-text search
$(document).ready(function() {

  // Helper methods
  //
  var escapeRegExChars = function (value) {
    return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
  }

  // Initialize autocomplete
  //
  $('#search').autocomplete({
    preserveInput: true,

    lookup: function(query, done) {
      var suggestions = []
      var results     = window.lunrIndex.search(query)

      results = results.slice(0, 5)

      $.each(results, function (index, val) {
        var doc = window.lunrData.docs[val.ref]

        suggestions.push({
          value: doc.title, data: doc.url, ref: val.ref, section: {  }
        })
      })

      if (results.length === 0) { return false }
      done({ suggestions: suggestions })
    },

    formatResult: function(suggestion, currentValue) {
      // Do not replace anything if the current value is empty
      if (!currentValue) {
        return suggestion.value;
      }

      var pattern = '(' + escapeRegExChars(currentValue) + ')';

      var title = suggestion.value
        .replace(new RegExp(pattern, 'gi'), '<span class="highlighted">$1<\/span>')

      var doc = window.lunrData.docs[suggestion.ref]
      var excerpt = excerptSearch(currentValue, doc.content, {
        padding: 40,
        highlightClass: 'highlighted'
      })

      return "<strong>" + title + "</strong><br/><div class='text-muted'>" + excerpt + "</div>"
    },

    onSelect: function (suggestion) {
      window.location.replace(suggestion.data)
    }
  })
  $('search').autocomplete('disable')


  // Setup lunr.js
  //
  window.lunrIndex = null;
  window.lunrData  = null;

  $.ajax({
    url: "/search.json",
    cache: true,
    method: 'GET',
    success: function(data) {
      window.lunrData = data;
      window.lunrIndex = lunr.Index.load(lunrData.index);
      $('search').autocomplete('enable')
    }
  });
})
