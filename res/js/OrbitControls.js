/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finger swipe

import {world2LonLat} from './../../src/utils';
const {sin, cos} = Math;
const MIN_NUM = 0.000001;

THREE.OrbitControls = function ( object, domElement ) {

    this.targetObj = new THREE.Mesh(new THREE.SphereGeometry(1000), new THREE.MeshBasicMaterial({color: 'red'}));
    // window.scene.add(this.targetObj);
    window.orbit = this;
	this.object = object;

	this.rotateUp = rotateUp;
	this.rotateLeft = rotateLeft;
	this.tiltUp = tiltUp;
	this.tiltLeft = tiltLeft;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus
	this.target = new THREE.Vector3();
	this.centerRotateTarget = new THREE.Vector3();

	// "rotateTarget" sets the location, where the object orbits around
    this.rotateTarget = new THREE.Vector3(0, 0, 0);

    // "tiltRotateTarget" sets the location, where the object orbits around when tilting
    this.tiltRotateTarget = new THREE.Vector3(0, 0, 0);

	// How far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// How far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to enable damping (inertia)
	// If damping is enabled, you must call controls.update() in your animation loop
	this.enableDamping = false;
	this.dampingFactor = 0.25;

	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	// Set to false to disable zooming
	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	// Set to false to disable rotating
	this.enableRotate = true;
	this.rotateSpeed = 1.0;

	this.enableTilt = true;
	this.tiltSpeed = 1.0;

	// Set to false to disable panning
	this.enablePan = true;
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	// If auto-rotate is enabled, you must call controls.update() in your animation loop
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// Set to false to disable use of the keys
	this.enableKeys = true;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons
	// this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };
    this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: undefined, TILT: THREE.MOUSE.RIGHT, PAN: THREE.MOUSE.MIDDLE };

	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;

	//
	// public methods
	//

	this.getPolarAngle = function () {

		return spherical.phi;

	};

	this.getAzimuthalAngle = function () {

		return spherical.theta;

	};

	this.saveState = function () {

		scope.target0.copy( scope.target );
		scope.position0.copy( scope.object.position );
		scope.zoom0 = scope.object.zoom;

	};

	this.reset = function () {

		scope.target.copy( scope.target0 );
		scope.object.position.copy( scope.position0 );
		scope.object.zoom = scope.zoom0;

		scope.object.updateProjectionMatrix();
		scope.dispatchEvent( changeEvent );

		scope.update();

		state = STATE.NONE;

	};

    /**
	 * 旋转摄像机时，计算摄像机焦点在垂直方向上的旋转圆
     * @return {*}
     */
    let camTargetRotateObj = new THREE.Mesh(new THREE.SphereGeometry(100), new THREE.MeshBasicMaterial({color: 'yellow'}));
    /**
	 * 倾斜地球时，摄像机围绕地表某点旋转
     * @type {*}
     */
    // let camTiltRotateObj = new THREE.Mesh(new THREE.SphereGeometry(100), new THREE.MeshBasicMaterial({color: 'white'}));
    // window.scene.add(camTiltRotateObj);
    // window.scene.add(camTargetRotateObj);

    /**
	 * 计算旋转camera时，camera的对焦点与camera之间的向量
     * @return {string|*}
     */
	this.camTargetRotateSpherical = function() {
		const camPos = scope.object.position;
		const camUp = scope.object.up;
		const camTarget = scope.target;
		const origin = scope.rotateTarget;
        let tmpCamTarget = camTarget.clone().sub(origin);
        let crossPosUp = new THREE.Vector3().crossVectors(camPos.clone().sub(origin), camUp.clone().sub(origin));
		const x1 = crossPosUp.x;
        const y1 = crossPosUp.y;
        const z1 = crossPosUp.z;
        const x2 = tmpCamTarget.x;
        const y2 = tmpCamTarget.y;
        const z2 = tmpCamTarget.z;
        const k = (x1 * x2 + y1 * y2 + z1 * z2) / (x1 * x1 + y1 * y1 + z1 * z1);
        const x3 = k * x1;
        const y3 = k * y1;
        const z3 = k * z1;
        let camRotateTarget = new THREE.Vector3();
        // if(filterMinNumbOfVec(new THREE.Vector3(x3, y3, z3).sub(tmpCamTarget)).length() < MIN_NUM){
        	// camRotateTarget.copy(origin);
		// }else{
         //    camRotateTarget = new THREE.Vector3(x3, 0, z3).add(origin);
		// }
        camRotateTarget = new THREE.Vector3(x3, y3, z3).add(origin);
        camTargetRotateObj.position.copy(camRotateTarget);
        // let offset = camTarget.clone().sub(camRotateTarget);
		return camRotateTarget;
	};

	filterMinNumb = (num) => {
	    if(Math.abs(num) < MIN_NUM)
	    	return 0;
	    return num;
	};

	filterMinNumbOfVec = (vec) => {
		if(vec.x && Math.abs(vec.x) < MIN_NUM)
			vec.x = 0;
        if(vec.y && Math.abs(vec.y) < MIN_NUM)
            vec.y = 0;
        if(vec.z && Math.abs(vec.z) < MIN_NUM)
            vec.z = 0;
        return vec;
	};

    this.adjustTarget = function(originPos, sphericalDelta){
        const {object, target, rotateTarget} = this;
        const newCamPos = object.position.clone().sub(rotateTarget);

        const axisVec = new THREE.Vector3(0, 1, 0);

        let quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(axisVec.normalize(), sphericalDelta.theta);
        target.applyQuaternion(quaternion);

        axisVec.set(newCamPos.x, 0, newCamPos.z);
        axisVec.normalize();
        axisVec.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2));
        quaternion.setFromAxisAngle(axisVec, 1 * sphericalDelta.phi);
        target.applyQuaternion(quaternion);

        let upSpherical = new THREE.Spherical();
        upSpherical.setFromVector3(object.up);
        if(filterMinNumb(originPos.y) > 0){
            upSpherical.phi *= -1;
            upSpherical.theta -= Math.PI;
        }
        upSpherical.phi += sphericalDelta.phi;
        upSpherical.theta += sphericalDelta.theta;
        object.up.setFromSpherical(upSpherical);
    };

	// this method is exposed, but perhaps it would be better if we can make it private...
	this.update = function () {
		var offset = new THREE.Vector3();
        let targetOffset = new THREE.Vector3();
		// so camera.up is the orbit axis
		var lastPosition = new THREE.Vector3();
		var lastQuaternion = new THREE.Quaternion();
        var targetVertSpherical = new THREE.Spherical();
        var upSpherical = new THREE.Spherical();
		return function update() {
			var position = scope.object.position;
			if(state === STATE.TILT || lastState === STATE.TILT && state === STATE.DOLLY){
			    if((tiltSphericalDelta.phi + tiltSphericalDelta.theta) === 0) return;
				// const {x, y, z} = scope.tiltRotateTarget;
				const lon = filterMinNumb(world2LonLat(scope.tiltRotateTarget)[0]);
                const lat = filterMinNumb(world2LonLat(scope.tiltRotateTarget)[1]);
                const eastNorthUpMat = new THREE.Matrix3();
                const inverseENUMat = new THREE.Matrix3();
                const slat = sin(lat);
                const clat = cos(lat);
                const slon = sin(lon);
                const clon = cos(lon);
                eastNorthUpMat.set(
                    clon, 0, -slon,
					-slat*slon, clat, -slat*clon,
					clat*slon, slat, clat*clon
				);
                inverseENUMat.getInverse(eastNorthUpMat);

                let tiltTargetOffset = position.clone().sub(scope.tiltRotateTarget);
                let z = tiltTargetOffset.clone().normalize();
                let up = scope.tiltRotateTarget.clone().normalize();
                let offsetInENU = tiltTargetOffset.clone().applyMatrix3(eastNorthUpMat);
			    if(tiltTargetOffset.z < 0 && tiltTargetOffset.z > -0.001) tiltTargetOffset.z = 0;
			    tiltSpherical.setFromVector3(offsetInENU);
                // console.log(tiltSpherical);
			    tiltSpherical.theta += tiltSphericalDelta.theta;
			    tiltSpherical.phi += tiltSphericalDelta.phi;
                tiltSpherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, tiltSpherical.theta));
                tiltSpherical.phi = Math.max(Math.PI * 0.5, Math.min(Math.PI * 0.75, tiltSpherical.phi));
                if(tiltSpherical.phi === Math.PI / 2) {
                    tiltSphericalDelta.set(0,0,0);
                	return;
                }
                // console.log(tiltSpherical)
                tiltSpherical.radius *= scale;
                scale = 1;
                offsetInENU.setFromSpherical(tiltSpherical);
                // tiltTargetOffset.applyQuaternion(tiltQuatInverse);
                position.copy(offsetInENU.clone().applyMatrix3(inverseENUMat)).add(scope.tiltRotateTarget);
                // position.copy(scope.tiltRotateTarget).add(tiltTargetOffset);
                // camTiltRotateObj.position.copy(scope.tiltRotateTarget);

                object.up.copy(scope.tiltRotateTarget.clone().normalize());
                scope.target.copy(scope.tiltRotateTarget);
                scope.targetObj.position.copy(scope.target);
                scope.object.lookAt(scope.target);
                tiltSphericalDelta.set(0,0,0);
			}else {
                var position = scope.object.position;
                var originPos = position.clone();

                // so camera.up is the orbit axis
                // var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
                // var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
                // var quatInverse = quat.clone().inverse();


                offset.copy( position ).sub( scope.rotateTarget );
                // rotate offset to "y-axis-is-up" space
                // offset.applyQuaternion( quat );
                // angle from z-axis around y-axis
                spherical.setFromVector3( offset );
                if ( scope.autoRotate && state === STATE.NONE ) {
                    rotateLeft( getAutoRotationAngle() );
                }

                spherical.theta += sphericalDelta.theta;
                spherical.phi += sphericalDelta.phi;
                // restrict theta to be between desired limits
                spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) );
                // restrict phi to be between desired limits
                spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );

                spherical.makeSafe();

                spherical.radius *= scale;
                // restrict radius to be between desired limits
                spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

                // move target to panned location
                scope.target.add( panOffset );

                offset.setFromSpherical( spherical );
                // rotate offset back to "camera-up-vector-is-up" space
                // offset.applyQuaternion( quatInverse );

                position.copy( scope.rotateTarget ).add( offset );

                if(panOffset.length() ===0 && !scope.target.equals(scope.rotateTarget)){
                    scope.adjustTarget(originPos, sphericalDelta);
                }

                scope.targetObj.position.copy(scope.target);
                scope.object.lookAt( scope.target );
                if ( scope.enableDamping === true ) {
                    sphericalDelta.theta *= ( 1 - scope.dampingFactor );
                    sphericalDelta.phi *= ( 1 - scope.dampingFactor );
                } else {
                    sphericalDelta.set( 0, 0, 0 );
                }

                scale = 1;
                panOffset.set( 0, 0, 0 );

                // update condition is:
                // min(camera displacement, camera rotation in radians)^2 > EPS
                // using small-angle approximation cos(x/2) = 1 - x^2 / 8
                if ( zoomChanged ||
                    lastPosition.distanceToSquared( scope.object.position ) > EPS ||
                    8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {
                    scope.dispatchEvent( changeEvent );
                    lastPosition.copy( scope.object.position );
                    lastQuaternion.copy( scope.object.quaternion );
                    zoomChanged = false;
                    return true;
                }
                return false;
            }
		};

	}();

	this.dispose = function () {

		scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
		scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		scope.domElement.removeEventListener( 'wheel', onMouseWheel, false );

		scope.domElement.removeEventListener( 'touchstart', onTouchStart, false );
		scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );
		scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );

		document.removeEventListener( 'mousemove', this.onMouseMove, false ); //yaojia7
		document.removeEventListener( 'mouseup', onMouseUp, false );

		window.removeEventListener( 'keydown', onKeyDown, false );

		//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

	};

    this.enableMoveY = true; //yaojia7
    // this.enableMoveX = false; //yaojia7
    this.enableMoveX = true; //yaojia7
	this.enableTiltX = true;

	this.onMouseMove = function ( event ) {

		if ( this.enabled === false ) return;

		event.preventDefault();

		switch ( state ) {

			case STATE.ROTATE:

				if ( this.enableRotate === false ) return;

				handleMouseMoveRotate( event );

				break;

			case STATE.DOLLY:

				if ( this.enableZoom === false ) return;

				if(state !== STATE.DOLLY) lastState = state;
				handleMouseMoveDolly( event );

				break;

			case STATE.PAN:

				if ( this.enablePan === false ) return;

				handleMouseMovePan( event );

				break;

			case STATE.TILT:

				if( this.enableTilt === false ) return;

				handleMouseMoveTilt( event );

				break;

		}

	}

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

	var STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5, TILT: 6 };

	var state = STATE.NONE;
	var lastState = STATE.NONE;

	scope.setState = (s) => {
		state = s;
	}

	var EPS = 0.000001;

	// current position in spherical coordinates
	var spherical = new THREE.Spherical();
	var targetSpherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();

	// 用于计算 camera 倾斜时的倾斜和旋转角度
	var tiltSpherical = new THREE.Spherical();
	var tiltSphericalDelta = new THREE.Spherical();
	var tiltStart = new THREE.Vector2();
    var tiltEnd = new THREE.Vector2();
    var tiltDelta = new THREE.Vector2();

	var scale = 1;
	var panOffset = new THREE.Vector3();
	var zoomChanged = false;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

    var lastIntersection = null;

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function rotateLeft( angle ) {

		sphericalDelta.theta -= angle;

	}

	function rotateUp( angle ) {

		sphericalDelta.phi -= angle;

	}

	function tiltLeft( angle ){
		tiltSphericalDelta.theta -= angle;
	}

	function tiltUp( angle ){
	    if(angle > 0) scope.isUp = true;
	    else scope.isUp = false;
		tiltSphericalDelta.phi -= angle;
	}

	var panLeft = function () {

		var v = new THREE.Vector3();

		return function panLeft( distance, objectMatrix ) {

			v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
			v.multiplyScalar( - distance );

			panOffset.add( v );

		};

	}();

	var panUp = function () {

		var v = new THREE.Vector3();

		return function panUp( distance, objectMatrix ) {

			v.setFromMatrixColumn( objectMatrix, 1 ); // get Y column of objectMatrix
			v.multiplyScalar( distance );

			panOffset.add( v );

		};

	}();

    scope.panl = panLeft;
    scope.panu = panUp;
	// deltaX and deltaY are in pixels; right and down are positive
	var pan = function () {

		var offset = new THREE.Vector3();

		return function pan( deltaX, deltaY ) {

			var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

			if ( scope.object instanceof THREE.PerspectiveCamera ) {

				// perspective
				var position = scope.object.position;
				offset.copy( position ).sub( scope.target );
				var targetDistance = offset.length();

				// half of the fov is center to top of screen
				targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

				// we actually don't use screenWidth, since perspective camera is fixed to screen height
				panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
				panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );

			} else if ( scope.object instanceof THREE.OrthographicCamera ) {

				// orthographic
				panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
				panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );

			} else {

				// camera neither orthographic nor perspective
				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
				scope.enablePan = false;

			}

		};

	}();

	function dollyIn( dollyScale ) {

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			scale /= dollyScale;

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	function dollyOut( dollyScale ) {

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			scale *= dollyScale;

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	//
	// event callbacks - update the object state
	//

	function handleMouseDownRotate( event ) {

		//console.log( 'handleMouseDownRotate' );

		lastIntersection = null;
		rotateStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownTilt( event ){
		object.lastTiltDeltaX = 0;
		tiltStart.set( event.clientX, event.clientY );
	}

	function handleMouseDownDolly( event ) {
		lastIntersection = null;

		//console.log( 'handleMouseDownDolly' );

		dollyStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownPan( event ) {

		//console.log( 'handleMouseDownPan' );
		lastIntersection = null;
		panStart.set( event.clientX, event.clientY );

	}

	function handleMouseMoveTilt( event ){
        // console.log( 'handleMouseMoveTilt' );
        tiltEnd.set(event.clientX, event.clientY);
        tiltDelta.subVectors(tiltEnd, tiltStart);
        const {x, y} = tiltDelta;
        if((Math.abs(x) + Math.abs(y)) < 2) return; //
		let element = scope.domElement === document ? scope.domElement.body : scope.domElement;
		if(Math.abs(x) > Math.abs(y)) {
		    const angle = 2 * Math.PI * x / element.clientWidth * scope.tiltSpeed;
		    object.lastTiltDeltaX -= angle;
			tiltLeft(angle);
        }
		else tiltUp( 2 * Math.PI * y / element.clientHeight * scope.tiltSpeed );

		tiltStart.copy(tiltEnd);
		let windowCenter = [0, 0, 0.5];
		let vector = new THREE.Vector3(...windowCenter).unproject(scope.object);
		let rayCaster = new THREE.Raycaster(scope.object.position, vector.sub(scope.object.position).normalize());
		let intersections = rayCaster.intersectObject(window.element.earth);
		if(intersections.length > 0){
			if(!lastIntersection || Math.abs(lastIntersection.faceIndex - intersections[0].faceIndex) < 10){
                scope.tiltRotateTarget.copy(intersections[0].point);
                lastIntersection = intersections[0];
            } else {
			    scope.tiltRotateTarget.copy(lastIntersection.point);
            }
            scope.update();
		}
	}

	function handleMouseMoveRotate( event ) {
		// console.log( 'handleMouseMoveRotate' );
		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.subVectors( rotateEnd, rotateStart );
		if((Math.abs(rotateDelta.x) + Math.abs(rotateDelta.y)) < 1) return; //
		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
		// rotating across whole screen goes 360 degrees around
		if(scope.enableMoveX) rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
		// rotating up and down along whole screen attempts to go 360, but limited to 180
		if(scope.enableMoveY) rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );
		rotateStart.copy( rotateEnd );
		scope.update();
	}

	function handleMouseMoveDolly( event ) {

		//console.log( 'handleMouseMoveDolly' );

		dollyEnd.set( event.clientX, event.clientY );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyIn( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyOut( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleMouseMovePan( event ) {

		//console.log( 'handleMouseMovePan' );

		panEnd.set( event.clientX, event.clientY );

		panDelta.subVectors( panEnd, panStart );

		pan( panDelta.x, panDelta.y ); //yaojia7

		panStart.copy( panEnd );

		scope.update();

	}

	function handleMouseUp( event ) {

		// console.log( 'handleMouseUp' );

	}

	function handleMouseWheel( event ) {

		// console.log( 'handleMouseWheel' );

        if(state !== STATE.DOLLY) lastState = state;
        state = STATE.DOLLY;
		if ( event.deltaY < 0 ) {

			dollyOut( getZoomScale() );

		} else if ( event.deltaY > 0 ) {

			dollyIn( getZoomScale() );

		}

		scope.update();

	}

	function handleKeyDown( event ) {

		//console.log( 'handleKeyDown' );

		switch ( event.keyCode ) {

			case scope.keys.UP:
				pan( 0, scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.BOTTOM:
				pan( 0, - scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.LEFT:
				pan( scope.keyPanSpeed, 0 );
				scope.update();
				break;

			case scope.keys.RIGHT:
				pan( - scope.keyPanSpeed, 0 );
				scope.update();
				break;

		}

	}

	function handleTouchStartRotate( event ) {

		//console.log( 'handleTouchStartRotate' );

		rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

	}

	function handleTouchStartDolly( event ) {

		//console.log( 'handleTouchStartDolly' );

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyStart.set( 0, distance );

	}

	function handleTouchStartPan( event ) {

		//console.log( 'handleTouchStartPan' );

		panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

	}

	function handleTouchMoveRotate( event ) {

		//console.log( 'handleTouchMoveRotate' );

		rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		rotateDelta.subVectors( rotateEnd, rotateStart );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		// rotating across whole screen goes 360 degrees around
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleTouchMoveDolly( event ) {

		//console.log( 'handleTouchMoveDolly' );

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyEnd.set( 0, distance );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyOut( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyIn( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleTouchMovePan( event ) {

		//console.log( 'handleTouchMovePan' );

		panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

		panDelta.subVectors( panEnd, panStart );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();

	}

	function handleTouchEnd( event ) {

		//console.log( 'handleTouchEnd' );

	}

	//
	// event handlers - FSM: listen for events and reset state
	//

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( event.button ) {

			case scope.mouseButtons.ORBIT:

				if ( scope.enableRotate === false ) return;

				handleMouseDownRotate( event );

				if(state !== STATE.ROTATE) lastState = state;
				state = STATE.ROTATE;

				break;

			case scope.mouseButtons.ZOOM:

				if ( scope.enableZoom === false ) return;

				handleMouseDownDolly( event );

                if(state !== STATE.DOLLY) lastState = state;
				state = STATE.DOLLY;

				break;

			case scope.mouseButtons.PAN:

				if ( scope.enablePan === false ) return;

				handleMouseDownPan( event );

                if(state !== STATE.PAN) lastState = state;
				state = STATE.PAN;

				break;

			case scope.mouseButtons.TILT:

				if ( scope.enableTilt === false ) return;

                if(state !== STATE.TILT) lastState = state;
				handleMouseDownTilt( event );

				state = STATE.TILT;

				break;
		}

		if ( state !== STATE.NONE ) {

			document.addEventListener( 'mousemove', scope.onMouseMove, false ); //yaojia7
			document.addEventListener( 'mouseup', onMouseUp, false );

			scope.dispatchEvent( startEvent );

		}

	}

	function onMouseUp( event ) {

		if ( scope.enabled === false ) return;

		if(state === STATE.TILT){
			// object.position.copy(object.lastPos);
			// object.rotation.copy(object.lastRot);
            // object.up.set(0, 1, 0);
			// object.lookAt(scope.target);
			setTimeout(() => {
                tiltLeft(object.lastTiltDeltaX);
                object.lastTiltDeltaX = 0;
                scope.update();
			}, 100)
		}
		handleMouseUp( event );

		document.removeEventListener( 'mousemove', scope.onMouseMove, false ); //yaojia7
		document.removeEventListener( 'mouseup', onMouseUp, false );

		scope.dispatchEvent( endEvent );

		// state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false || scope.enableZoom === false ) return;
        // if ( scope.enabled === false || scope.enableZoom === false || ( state !== STATE.NONE && state !== STATE.ROTATE ) ) return;

		event.preventDefault();
		event.stopPropagation();

		handleMouseWheel( event );

		scope.dispatchEvent( startEvent ); // not sure why these are here...
		scope.dispatchEvent( endEvent );

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;

		handleKeyDown( event );

	}

	function onTouchStart( event ) {

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:	// one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;

				handleTouchStartRotate( event );

				state = STATE.TOUCH_ROTATE;

				break;

			case 2:	// two-fingered touch: dolly

				if ( scope.enableZoom === false ) return;

				handleTouchStartDolly( event );

				state = STATE.TOUCH_DOLLY;

				break;

			case 3: // three-fingered touch: pan

				if ( scope.enablePan === false ) return;

				handleTouchStartPan( event );

				state = STATE.TOUCH_PAN;

				break;

			default:

				state = STATE.NONE;

		}

		if ( state !== STATE.NONE ) {

			scope.dispatchEvent( startEvent );

		}

	}

	function onTouchMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		switch ( event.touches.length ) {

			case 1: // one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;
				if ( state !== STATE.TOUCH_ROTATE ) return; // is this needed?...

				handleTouchMoveRotate( event );

				break;

			case 2: // two-fingered touch: dolly

				if ( scope.enableZoom === false ) return;
				if ( state !== STATE.TOUCH_DOLLY ) return; // is this needed?...

				handleTouchMoveDolly( event );

				break;

			case 3: // three-fingered touch: pan

				if ( scope.enablePan === false ) return;
				if ( state !== STATE.TOUCH_PAN ) return; // is this needed?...

				handleTouchMovePan( event );

				break;

			default:

				state = STATE.NONE;

		}

	}

	function onTouchEnd( event ) {

		if ( scope.enabled === false ) return;

		handleTouchEnd( event );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onContextMenu( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

	}

	//

	scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );

	scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
	scope.domElement.addEventListener( 'wheel', onMouseWheel, false );

	scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
	scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
	scope.domElement.addEventListener( 'touchmove', onTouchMove, false );

	window.addEventListener( 'keydown', onKeyDown, false );

	// force an update at start

	this.update();

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

Object.defineProperties( THREE.OrbitControls.prototype, {

	center: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .center has been renamed to .target' );
			return this.target;

		}

	},

	// backward compatibility

	noZoom: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			return ! this.enableZoom;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			this.enableZoom = ! value;

		}

	},

	noRotate: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			return ! this.enableRotate;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			this.enableRotate = ! value;

		}

	},

	noPan: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			return ! this.enablePan;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			this.enablePan = ! value;

		}

	},

	noKeys: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			return ! this.enableKeys;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			this.enableKeys = ! value;

		}

	},

	staticMoving: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			return ! this.enableDamping;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			this.enableDamping = ! value;

		}

	},

	dynamicDampingFactor: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			return this.dampingFactor;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			this.dampingFactor = value;

		}

	}

} );
