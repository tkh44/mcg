"use strict";

mcgApp.controller('ColorGeneratorCtrl',
function ($scope, $mdDialog)
{
	$scope.init = function ()
	{
		// Define base palette
		$scope.palette = {
			colors: [],
			orig  : [],
			base  : '#26a69a',
			json  : '',
			name  : ''
		};

		// Define palettes
		$scope.palettes = [];

		// Add base palette
		$scope.addBasePalette();

		// Define theme defaults
		$scope.theme = {
			name: '',
            palettes: $scope.palettes
		};
	};

	// Function to add a palette to palettes.
	$scope.addBasePalette = function(){
		$scope.palettes.push(angular.copy($scope.palette));
		$scope.calcPalette($scope.palettes.length-1);

		// GA Event Track
		ga('send', 'event', 'mcg', 'add_palette');
	};

	// Function to calculate all colors for all palettes
	$scope.calcPalettes = function(){
		for(var i = 0; i < $scope.palettes.length; i++){
			$scope.calcPalette(i);
		}
	};

	// Function to delete a palette when passed it's key.
	$scope.deletePalette = function(key){
		$scope.palettes.remove(key);
		// GA Event Track
		ga('send', 'event', 'mcg', 'remove_palette');
	};

	// Function to assign watchers to all bases
	$scope.calcPalette = function(key){
		$scope.palettes[key].orig = $scope.computeColors($scope.palettes[key].base);
		$scope.palettes[key].colors = $scope.palettes[key].orig;
	};

	// Function to make the definePalette code for a palette.
	$scope.createDefinePalette = function(palette){
		return '$mdThemingProvider.definePalette(\'' + palette.name + '\', ' + $scope.makeColorsJson(palette.colors) + ');';
	};

	// Function to make an exportable json array for themes.
	$scope.makeColorsJson = function(colors){
		var exportable = {};
		angular.forEach(colors, function(value, key){
			exportable[value.name] = value.hex;
		});
		return JSON.stringify(exportable, null, 4);
	};

	// Function to calculate all colors from base
	$scope.computeColors = function(color)
	{
		// Return array of color objects.
		return [
			{
				hex: shadeColor(color, 0.9),
				name : '50'
			},
			{
				hex: shadeColor(color, 0.7),
				name : '100'
			},
			{
				hex: shadeColor(color, 0.5),
				name : '200'
			},
			{
				hex: shadeColor(color, 0.333),
				name : '300'
			},
			{
				hex: shadeColor(color, 0.166),
				name : '400'
			},
			{
				hex: shadeColor(color, 0),
				name : '500'
			},
			{
				hex : shadeColor(color, -0.125),
				name: '600'
			},
			{
				hex : shadeColor(color, -0.25),
				name: '700'
			},
			{
				hex : shadeColor(color, -0.375),
				name: '800'
			},
			{
				hex : shadeColor(color, -0.5),
				name: '900'
			},
			{
				hex : shadeColor(color, 0.7),
				name: 'A100'
			},
			{
				hex : shadeColor(color, 0.5),
				name: 'A200'
			},
			{
				hex : shadeColor(color, 0.166),
				name: 'A400'
			},
			{
				hex : shadeColor(color, -0.25),
				name: 'A700'
			}
		];
	};

    // Function to show theme's full code
    $scope.showThemeCode = function()
    {
	    // Check to see that a theme name and palette names are set.
	    if(
		    typeof $scope.theme.name === 'undefined' || $scope.theme.name.length < 1 ||
		    typeof $scope.palettes[0] === 'undefined' || typeof $scope.palettes[0].name === 'undefined' || $scope.palettes[0].name.length < 1 ||
		    typeof $scope.palettes[1] === 'undefined' || typeof $scope.palettes[1].name === 'undefined' || $scope.palettes[1].name.length < 1
	    ){
		    alert('To generate the code for a theme you must provide a theme name and at least two palettes with names.');
		    return false;
	    }

        // Init return string
        var themeCodeString = '';

        // For each palette, add it's declaration
        for(var i = 0; i < $scope.palettes.length; i++){
            themeCodeString = themeCodeString+$scope.createDefinePalette($scope.palettes[i])+'\n\r';
        }

        // Add theme configuration
        themeCodeString = themeCodeString +
        '$mdThemingProvider.theme(\'' + $scope.theme.name + '\')\n\r\t'+
        '.primaryPalette(\''+$scope.palettes[0].name+'\')\n\r\t'+
        '.accentPalette(\''+$scope.palettes[1].name+'\');'
        +'\n\r';

        // Show clipboard with theme code
        $scope.showClipboard(themeCodeString);

	    // GA Event Track
	    ga('send', 'event', 'mcg', 'copy_code_theme');
    };

	// Function to regenerate json and show dialog for palette.
	$scope.showPaletteCode = function(palette)
	{
		// Check to see that this palette has a name
		if (
			typeof palette === 'undefined' ||
			typeof palette.name === 'undefined' ||
			palette.name.length < 1
		) {
			alert('To generate the code for a palette the palette must have a name.');
			return false;
		}

		// Generate palette's code
		palette.json = $scope.createDefinePalette(palette);

		// Show code
		$scope.showClipboard(palette.json);

		// GA Event Track
		ga('send', 'event', 'mcg', 'copy_code_palette');
	};

    // Function to show export json for loading carts later
    $scope.showExport = function(){
        $scope.showClipboard(JSON.stringify($scope.theme, null, 2));
    };

	// Function to show generic clipboard alert dialog
	$scope.showClipboard = function(code){
		$mdDialog.show({
			template   : '<md-dialog aria-label="Clipboard dialog">' +
			'  <md-content>' +
			'    <pre>{{code}}' +
			'    </pre>' +
			'  </md-content>' +
			'  <div class="md-actions">' +
			'    <md-button ng-click="closeDialog()">' +
			'      Close' +
			'    </md-button>' +
			'  </div>' +
			'</md-dialog>',
			locals     : {
				code: code
			},
			controller : ClipboardDialogController
		});

		// GA Event Track
		ga('send', 'event', 'mcg', 'copy_code');

		function ClipboardDialogController(scope, $mdDialog, code) {
			scope.code = code;
			scope.closeDialog = function () {
				$mdDialog.hide();
			}
		}
	};

    // Function to darken a palette's color.
    $scope.darkenPaletteItem = function(color){
        color.hex = shadeColor(color.hex, -0.1);
    };

    // Function to lighten a palette's color.
    $scope.lightenPaletteItem = function(color){
        color.hex = shadeColor(color.hex, 0.1);
    };

	// Init controller
	$scope.init();
});