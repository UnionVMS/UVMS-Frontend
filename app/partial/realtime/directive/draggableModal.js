angular.module('unionvmsWeb')
.directive('draggableModal', ['$document',
    function($document) {
        return {
            restrict: 'AC',
            link: function(scope, iElement, iAttrs) {
                var startX = 0,
                    startY = 0,
                    x = 0,
                    y = 0;

                var dialogWrapper = iElement.parent().parent();

                dialogWrapper.css({
                    position: 'relative'
                });

                dialogWrapper.on('mousedown', function(event) {
                    // Prevent default dragging of selected content
                    event.preventDefault();
                    startX = event.pageX - x;
                    startY = event.pageY - y;
                    $document.on('mousemove', mousemove);
                    $document.on('mouseup', mouseup);
                });

                function mousemove(event) {
                    y = event.pageY - startY;
                    x = event.pageX - startX;
                    dialogWrapper.css({
                        top: y + 'px',
                        left: x + 'px'
                    });
                }

                function mouseup() {
                    $document.unbind('mousemove', mousemove);
                    $document.unbind('mouseup', mouseup);
                }
            }
        };
    }
]);
