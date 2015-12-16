var app = angular.module('unionvmsWeb');

app.controller('help.controller', HelpController);

HelpController.$inject = ['help.lang', 'help.toc', '$anchorScroll', '$location'];

function HelpController(lang, toc, $anchorScroll, $location) {
	toc.reset();
	this.sections = toc.sections;
	this.titles = toc.titles;
	this.goTo = goTo;
	this.localizedUrl = 'partial/help/help-' + lang + '.html';
	this.localizedSrc = localizedUrl;
	this.localize = function(url) {
		return 'partial/help/' + lang + '/' + url;
	};

	this.pages = [
		'00-welcome.html',
		'01-login.html',
		'02-overview.html',
		'03-assets.html',
		'04-mobileTerminals.html',
		'05-positions.html',
		'06-polling.html',
		'07-alarms.html',
		'08-exchange.html',
		'09-reports.html',
		'10-user.html',
		'11-glossary.html'
	];

	function goTo(index) {
		$location.hash(index);
		$anchorScroll(index);
	}

	function localizedUrl(url) {
		return 'assets/help/img/' + lang + '/' + url;
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

	var sectionIndexes = {};
	function getInsertionIndex(sectionIndex) {
		var i = toc.sections.length;
		if (sectionIndex === undefined) {
			return i;
		}

		while (i > 0 && sectionIndexes[toc.sections[i-1]] > sectionIndex) {
			i--;
		}

		return i;
	}

	toc.add = function(section, title, index) {
		sectionIndexes[section] = Number(index);
		toc.sections.splice(getInsertionIndex(index), 0, section);
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
			toc.add(attrs.helpSection, elem.html(), attrs.index);
			elem.attr('id', attrs.helpSection);
		}
	};
}]);

app.directive('localizedSrc', ['help.lang', function(lang) {
	return {
		restict: 'A',
		compile: function(elem, attrs) {
			elem.attr('src', 'assets/help/img/' + lang + '/' + attrs.localizedSrc);
		}
	};
}]);

app.directive('wrapped', ['$compile', 'help.lang', function($compile, lang) {
	return {
		restrict: 'A',
		replace: true,
		link: function(scope, element, attrs) {
			var url = 'assets/help/img/' + lang + '/' + attrs.url;
			var clazz = attrs.class;
			var html = '<div class="img-wrapper"><img src="' + url +  '" class="' + clazz + '"></div>';
			element.replaceWith(html);
			
			
		}
	};
}]);