var app = angular.module('unionvmsWeb');

app.controller('help.controller', HelpController);

HelpController.$inject = ['help.lang', 'help.toc', '$anchorScroll', '$location'];

function HelpController(lang, toc, $anchorScroll, $location) {
	toc.reset();
	this.sections = toc.sections;
	this.titles = toc.titles;
	this.goTo = goTo;
	this.localizedUrl = 'partial/help/help-' + lang + '.html';

	function goTo(index) {
		$location.hash(index);
		$anchorScroll(index);
	}
}

app.constant('help.langReplacements', {
	"sv": "en"
});

app.factory('help.lang', ['locale', 'help.langReplacements', function(locale, replacements) {
	var lang = locale.getLocale();
	var index = lang.indexOf('-');
	if (index >= 0) {
		// example: 'en-us' -> 'en'
		lang = lang.substring(0, index);
	}

	return replacements[lang] || lang;
}]);

app.factory('help.toc', [function() {
	var toc = {};
	toc.sections = [];
	toc.titles = {};
	toc.add = function(section, title) {
		toc.sections.push(section);
		toc.titles[section] = title;
	};
	toc.reset = function() {
		toc.sections = [];
		toc.titles = {};
	};

	return toc;
}]);

app.directive('helpSection', ['help.toc', function(toc) {
	return {
		restict: 'A',
		compile: function(elem, attrs) {
			toc.add(attrs.helpSection, elem.html());
			elem.attr('id', attrs.helpSection);
		}
	};
}]);

app.directive('localizedSrc', ['help.lang', function(lang) {
	return {
		restict: 'A',
		compile: function(elem, attrs) {
			elem.attr('src', 'partial/help/img/' + lang + '/' + attrs.localizedSrc);
		}
	};
}]);