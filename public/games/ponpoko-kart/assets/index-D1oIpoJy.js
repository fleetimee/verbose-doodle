const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./rural-D_WNArV8.js","./BufferGeometryUtils-Do0slb5M.js","./util-BjtpZIRT.js","./shrine-XOlbh7ba.js","./festival-C4MIQmKz.js","./icons-BC_Gy1-4.js"])))=>i.map(i=>d[i]);
import{$ as e,$n as t,A as n,An as r,B as i,Bn as a,C as o,Cn as s,Ct as c,D as l,Dn as u,E as d,En as f,Et as p,F as m,Fn as h,G as g,H as _,Hn as v,I as y,In as b,J as x,Jn as S,Kn as C,L as w,Ln as T,M as E,Mn as D,Mt as O,N as k,Nn as A,Nt as ee,O as te,Ot as j,P as M,Pn as N,Q as ne,Qn as re,Rn as ie,S as ae,Sn as oe,St as se,T as ce,Tn as P,Tt as le,U as ue,V as de,Vn as fe,W as pe,Wn as me,X as he,Xn as F,Y as ge,Yn as _e,Zn as I,_ as L,_t as ve,a as ye,ar as be,at as xe,b as Se,bt as Ce,c as we,cr as Te,ct as Ee,d as De,dn as Oe,dr as ke,dt as Ae,er as je,et as Me,f as Ne,fn as Pe,fr as Fe,ft as R,g as Ie,gn as z,gt as Le,h as B,hn as Re,ht as ze,i as V,ir as Be,it as H,j as Ve,jn as He,k as Ue,ln as We,lr as Ge,lt as Ke,m as qe,mn as Je,mt as Ye,nr as Xe,nt as Ze,o as Qe,or as $e,ot as U,p as et,pr as tt,pt as nt,q as rt,qn as it,rr as at,rt as ot,s as st,sr as ct,st as lt,t as ut,tt as dt,u as ft,un as pt,ur as mt,v as ht,vt as gt,w as _t,wn as vt,wt as yt,x as bt,xt,y as St,yt as Ct,z as W,zn as wt}from"./BufferGeometryUtils-Do0slb5M.js";var Tt=Object.defineProperty,Et=(e,t)=>{let n={};for(var r in e)Tt(n,r,{get:e[r],enumerable:!0});return t||Tt(n,Symbol.toStringTag,{value:`Module`}),n};(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function Dt(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Ot(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var kt={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},G={common:{diffuse:{value:new B(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new H}},envmap:{envMap:{value:null},envMapRotation:{value:new H},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new H}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new H}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new H},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new H},normalScale:{value:new F(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new H},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new H}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new H}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new H}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new B(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new I},probesMax:{value:new I},probesResolution:{value:new I}},points:{diffuse:{value:new B(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0},uvTransform:{value:new H}},sprite:{diffuse:{value:new B(16777215)},opacity:{value:1},center:{value:new F(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}}},At={basic:{uniforms:mt([G.common,G.specularmap,G.envmap,G.aomap,G.lightmap,G.fog]),vertexShader:kt.meshbasic_vert,fragmentShader:kt.meshbasic_frag},lambert:{uniforms:mt([G.common,G.specularmap,G.envmap,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.fog,G.lights,{emissive:{value:new B(0)},envMapIntensity:{value:1}}]),vertexShader:kt.meshlambert_vert,fragmentShader:kt.meshlambert_frag},phong:{uniforms:mt([G.common,G.specularmap,G.envmap,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.fog,G.lights,{emissive:{value:new B(0)},specular:{value:new B(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:kt.meshphong_vert,fragmentShader:kt.meshphong_frag},standard:{uniforms:mt([G.common,G.envmap,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.roughnessmap,G.metalnessmap,G.fog,G.lights,{emissive:{value:new B(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:kt.meshphysical_vert,fragmentShader:kt.meshphysical_frag},toon:{uniforms:mt([G.common,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.gradientmap,G.fog,G.lights,{emissive:{value:new B(0)}}]),vertexShader:kt.meshtoon_vert,fragmentShader:kt.meshtoon_frag},matcap:{uniforms:mt([G.common,G.bumpmap,G.normalmap,G.displacementmap,G.fog,{matcap:{value:null}}]),vertexShader:kt.meshmatcap_vert,fragmentShader:kt.meshmatcap_frag},points:{uniforms:mt([G.points,G.fog]),vertexShader:kt.points_vert,fragmentShader:kt.points_frag},dashed:{uniforms:mt([G.common,G.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:kt.linedashed_vert,fragmentShader:kt.linedashed_frag},depth:{uniforms:mt([G.common,G.displacementmap]),vertexShader:kt.depth_vert,fragmentShader:kt.depth_frag},normal:{uniforms:mt([G.common,G.bumpmap,G.normalmap,G.displacementmap,{opacity:{value:1}}]),vertexShader:kt.meshnormal_vert,fragmentShader:kt.meshnormal_frag},sprite:{uniforms:mt([G.sprite,G.fog]),vertexShader:kt.sprite_vert,fragmentShader:kt.sprite_frag},background:{uniforms:{uvTransform:{value:new H},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:kt.background_vert,fragmentShader:kt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new H}},vertexShader:kt.backgroundCube_vert,fragmentShader:kt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:kt.cube_vert,fragmentShader:kt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:kt.equirect_vert,fragmentShader:kt.equirect_frag},distance:{uniforms:mt([G.common,G.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:kt.distance_vert,fragmentShader:kt.distance_frag},shadow:{uniforms:mt([G.lights,G.fog,{color:{value:new B(0)},opacity:{value:1}}]),vertexShader:kt.shadow_vert,fragmentShader:kt.shadow_frag}};At.physical={uniforms:mt([At.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new H},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new H},clearcoatNormalScale:{value:new F(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new H},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new H},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new H},sheen:{value:0},sheenColor:{value:new B(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new H},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new H},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new H},transmissionSamplerSize:{value:new F},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new H},attenuationDistance:{value:0},attenuationColor:{value:new B(0)},specularColor:{value:new B(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new H},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new H},anisotropyVector:{value:new F},anisotropyMap:{value:null},anisotropyMapTransform:{value:new H}}]),vertexShader:kt.meshphysical_vert,fragmentShader:kt.meshphysical_frag};var jt={r:0,b:0,g:0},Mt=new xe,Nt=new H;Nt.set(-1,0,0,0,1,0,0,0,1);function Pt(e,t,n,r,i,a){let o=new B(0),c=i===!0?0:1,l,u,d=null,f=0,p=null;function m(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function h(t){let r=!1,i=m(t);i===null?_(o,c):i&&i.isColor&&(_(i,1),r=!0);let s=e.xr.getEnvironmentBlendMode();s===`additive`?n.buffers.color.setClear(0,0,0,1,a):s===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function g(t,n){let i=m(n);i&&(i.isCubeTexture||i.mapping===306)?(u===void 0&&(u=new U(new Qe(1,1,1),new P({name:`BackgroundCubeMaterial`,uniforms:at(At.backgroundCube.uniforms),vertexShader:At.backgroundCube.vertexShader,fragmentShader:At.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),u.geometry.deleteAttribute(`uv`),u.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),u.material.uniforms.envMap.value=i,u.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Mt.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isCubeTexture&&i.isRenderTargetTexture===!1&&u.material.uniforms.backgroundRotation.value.premultiply(Nt),u.material.toneMapped=Ie.getTransfer(i.colorSpace)!==s,(d!==i||f!==i.version||p!==e.toneMapping)&&(u.material.needsUpdate=!0,d=i,f=i.version,p=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null)):i&&i.isTexture&&(l===void 0&&(l=new U(new se(2,2),new P({name:`BackgroundMaterial`,uniforms:at(At.background.uniforms),vertexShader:At.background.vertexShader,fragmentShader:At.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(l)),l.material.uniforms.t2D.value=i,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.toneMapped=Ie.getTransfer(i.colorSpace)!==s,i.matrixAutoUpdate===!0&&i.updateMatrix(),l.material.uniforms.uvTransform.value.copy(i.matrix),(d!==i||f!==i.version||p!==e.toneMapping)&&(l.material.needsUpdate=!0,d=i,f=i.version,p=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null))}function _(t,r){t.getRGB(jt,Te(e)),n.buffers.color.setClear(jt.r,jt.g,jt.b,r,a)}function v(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),c=t,_(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(e){c=e,_(o,c)},render:h,addToRenderList:g,dispose:v}}function Ft(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function It(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function Lt(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(Fe(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`);n.reversedDepthBuffer===!0&&f===!1&&Fe(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function Rt(e){let t=this,n=null,r=0,i=!1,a=!1,o=new xt,s=new H,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var zt=4,Bt=6,Vt=20,Ht=256,Ut=new gt,Wt=new B,Gt=null,Kt=0,qt=0,Jt=!1,Yt=new I,Xt=new I,Zt=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=Yt}=i;Gt=this._renderer.getRenderTarget(),Kt=this._renderer.getActiveCubeFace(),qt=this._renderer.getActiveMipmapLevel(),Jt=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=an(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=rn(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Gt,Kt,qt),this._renderer.xr.enabled=Jt,e.scissorTest=!1,en(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Gt=this._renderer.getRenderTarget(),Kt=this._renderer.getActiveCubeFace(),qt=this._renderer.getActiveMipmapLevel(),Jt=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:ne,minFilter:ne,generateMipmaps:!1,type:i,format:O,colorSpace:dt,depthBuffer:!1},r=$t(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=$t(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Qt(r)),this._blurMaterial=nn(r,e,t),this._ggxMaterial=tn(r,e,t)}return r}_compileMaterial(e){let t=new U(new we,e);this._renderer.compile(t,Ut)}_sceneToCubeUV(e,t,n,r,i){let a=new Ce(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(Wt),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new U(new Qe,new lt({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy(Wt),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;en(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=an()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=rn());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;en(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,Ut)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(c*1.25),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-zt?n-d+zt:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,en(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,Ut),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,en(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,Ut)}_blur(e,t,n,r){let i=this._pingPongRenderTarget,a=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,i,t,n,a),this._blurPass(i,e,n,n,a)}_blurPass(e,t,n,r,i){let a=this._renderer,o=this._blurMaterial,s=this._lodMeshes[r];s.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=i,c.mipInt.value=this._lodMax-n;let l=this._sizeLods[r];en(t,3*l*(r>this._lodMax-zt?r-this._lodMax+zt:0),4*(this._cubeSize-l),3*l,2*l),a.setRenderTarget(t),a.render(s,Ut)}};function Qt(e){let t=[],n=[],r=e,i=e-zt+1+Bt;for(let e=0;e<i;e++){let e=2**r;t.push(e);let i=1/(e-2),a=-i,o=1+i,s=[a,a,o,a,o,o,a,a,o,o,a,o],c=new Float32Array(108),l=new Float32Array(108);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];c.set(r,18*e);for(let t=0;t<6;t++){let n=s[t*2]*2-1,r=s[t*2+1]*2-1;e===0?Xt.set(1,r,n):e===1?Xt.set(-n,1,-r):e===2?Xt.set(-n,r,1):e===3?Xt.set(-1,r,-n):e===4?Xt.set(-n,-1,r):Xt.set(n,r,-1),Xt.toArray(l,(e*6+t)*3)}}let u=new we;u.setAttribute(`position`,new st(c,3)),u.setAttribute(`outputDirection`,new st(l,3)),n.push(new U(u,null)),r>zt&&r--}return{lodMeshes:n,sizeLods:t}}function $t(e,t,n){let r=new je(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function en(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function tn(e,t,n){return new P({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:Ht,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:on(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function nn(e,t,n){return new P({name:`SphericalGaussianBlur`,defines:{SAMPLES:Vt,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:on(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function rn(){return new P({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:on(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function an(){return new P({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:on(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function on(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var sn=class extends je{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Se(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Qe(5,5,5),i=new P({name:`CubemapFromEquirect`,uniforms:at(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new U(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=ne),new ht(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};function cn(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new sn(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new Zt(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new Zt(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function ln(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&tt(`WebGLRenderer: `+e+` extension not supported.`),t}}}function un(e,t,n,r){let i={},o=new WeakMap;function s(e){let a=e.target;a.index!==null&&t.remove(a.index);for(let e in a.attributes)t.remove(a.attributes[e]);a.removeEventListener(`dispose`,s),delete i[a.id];let c=o.get(a);c&&(t.remove(c),o.delete(a)),r.releaseStatesOfGeometry(a),a.isInstancedBufferGeometry===!0&&delete a._maxInstanceCount,n.memory.geometries--}function c(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,s),i[t.id]=!0,n.memory.geometries++,t)}function l(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function u(e){let n=[],r=e.index,i=e.attributes.position,s=0;if(i===void 0)return;if(r!==null){let e=r.array;s=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else{let e=i.array;s=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}let c=new(i.count>=65535?a:wt)(n,1);c.version=s;let l=o.get(e);l&&t.remove(l),o.set(e,c)}function d(e){let t=o.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&u(e)}else u(e);return o.get(e)}return{get:c,update:l,getWireframeAttribute:d}}function dn(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function fn(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:$e(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function pn(e,t,n){let r=new WeakMap,i=new re;function a(a,s,c){let l=a.morphTargetInfluences,u=s.morphAttributes.position||s.morphAttributes.normal||s.morphAttributes.color,d=u===void 0?0:u.length,f=r.get(s);if(f===void 0||f.count!==d){f!==void 0&&f.texture.dispose();let e=s.morphAttributes.position!==void 0,n=s.morphAttributes.normal!==void 0,a=s.morphAttributes.color!==void 0,c=s.morphAttributes.position||[],l=s.morphAttributes.normal||[],u=s.morphAttributes.color||[],p=0;e===!0&&(p=1),n===!0&&(p=2),a===!0&&(p=3);let h=s.attributes.position.count*p,g=1;h>t.maxTextureSize&&(g=Math.ceil(h/t.maxTextureSize),h=t.maxTextureSize);let _=new Float32Array(h*g*4*d),v=new o(_,h,g,d);v.type=m,v.needsUpdate=!0;let y=p*4;for(let t=0;t<d;t++){let r=c[t],o=l[t],s=u[t],d=h*g*4*t;for(let t=0;t<r.count;t++){let c=t*y;e===!0&&(i.fromBufferAttribute(r,t),_[d+c+0]=i.x,_[d+c+1]=i.y,_[d+c+2]=i.z,_[d+c+3]=0),n===!0&&(i.fromBufferAttribute(o,t),_[d+c+4]=i.x,_[d+c+5]=i.y,_[d+c+6]=i.z,_[d+c+7]=0),a===!0&&(i.fromBufferAttribute(s,t),_[d+c+8]=i.x,_[d+c+9]=i.y,_[d+c+10]=i.z,_[d+c+11]=s.itemSize===4?i.w:1)}}f={count:d,texture:v,size:new F(h,g)},r.set(s,f);function b(){v.dispose(),r.delete(s),s.removeEventListener(`dispose`,b)}s.addEventListener(`dispose`,b)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<l.length;e++)t+=l[e];let n=s.morphTargetsRelative?1:1-t;c.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),c.getUniforms().setValue(e,`morphTargetInfluences`,l)}c.getUniforms().setValue(e,`morphTargetsTexture`,f.texture,n),c.getUniforms().setValue(e,`morphTargetsTextureSize`,f.size)}return{update:a}}function mn(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var hn={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function gn(e,t,n,r,a,o){let s=new je(t,n,{type:e,depthBuffer:a,stencilBuffer:o,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),c=null,l=null,u=new we;u.setAttribute(`position`,new M([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute(`uv`,new M([0,2,0,0,2,0],2));let d=new Oe({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new U(u,d),p=new gt(-1,1,1,-1,0,1),m=null,h=null,g=!1,_,v=null,y=[],b=!1;this.setSize=function(e,t){s.setSize(e,t),c!==null&&c.setSize(e,t),l!==null&&l.setSize(e,t);for(let n=0;n<y.length;n++){let r=y[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){y=e,b=y.length>0&&y[0].isRenderPass===!0;let t=s.width,n=s.height;y.length>0&&c===null&&(c=new je(t,n,{type:i,depthBuffer:!1,stencilBuffer:!1}),l=new je(t,n,{type:i,depthBuffer:!1,stencilBuffer:!1}));for(let e=0;e<y.length;e++){let r=y[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(g||e.toneMapping===0&&y.length===0)return!1;if(v=t,t!==null){let e=t.width,n=t.height;(s.width!==e||s.height!==n)&&this.setSize(e,n)}return b===!1&&e.setRenderTarget(s),_=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return b},this.end=function(e,t){e.toneMapping=_,g=!0;let n=s,r=c;for(let i=0;i<y.length;i++){let a=y[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===c?l:c))}if(m!==e.outputColorSpace||h!==e.toneMapping){m=e.outputColorSpace,h=e.toneMapping,d.defines={},Ie.getTransfer(m)===`srgb`&&(d.defines.SRGB_TRANSFER=``);let t=hn[h];t&&(d.defines[t]=``),d.needsUpdate=!0}d.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(v),e.render(f,p),v=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){s.dispose(),c!==null&&c.dispose(),l!==null&&l.dispose(),u.dispose(),d.dispose()}}var _n=new N,vn=new l(1,1),yn=new o,bn=new ae,xn=new Se,Sn=[],Cn=[],wn=new Float32Array(16),Tn=new Float32Array(9),En=new Float32Array(4);function Dn(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Sn[i];if(a===void 0&&(a=new Float32Array(i),Sn[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function On(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function kn(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function An(e,t){let n=Cn[t];n===void 0&&(n=new Int32Array(t),Cn[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function jn(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Mn(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(On(n,t))return;e.uniform2fv(this.addr,t),kn(n,t)}}function Nn(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(On(n,t))return;e.uniform3fv(this.addr,t),kn(n,t)}}function Pn(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(On(n,t))return;e.uniform4fv(this.addr,t),kn(n,t)}}function Fn(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(On(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),kn(n,t)}else{if(On(n,r))return;En.set(r),e.uniformMatrix2fv(this.addr,!1,En),kn(n,r)}}function In(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(On(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),kn(n,t)}else{if(On(n,r))return;Tn.set(r),e.uniformMatrix3fv(this.addr,!1,Tn),kn(n,r)}}function Ln(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(On(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),kn(n,t)}else{if(On(n,r))return;wn.set(r),e.uniformMatrix4fv(this.addr,!1,wn),kn(n,r)}}function Rn(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function zn(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(On(n,t))return;e.uniform2iv(this.addr,t),kn(n,t)}}function Bn(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(On(n,t))return;e.uniform3iv(this.addr,t),kn(n,t)}}function Vn(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(On(n,t))return;e.uniform4iv(this.addr,t),kn(n,t)}}function Hn(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Un(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(On(n,t))return;e.uniform2uiv(this.addr,t),kn(n,t)}}function Wn(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(On(n,t))return;e.uniform3uiv(this.addr,t),kn(n,t)}}function Gn(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(On(n,t))return;e.uniform4uiv(this.addr,t),kn(n,t)}}function Kn(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(vn.compareFunction=n.isReversedDepthBuffer()?518:515,a=vn):a=_n,n.setTexture2D(t||a,i)}function qn(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||bn,i)}function Jn(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||xn,i)}function Yn(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||yn,i)}function Xn(e){switch(e){case 5126:return jn;case 35664:return Mn;case 35665:return Nn;case 35666:return Pn;case 35674:return Fn;case 35675:return In;case 35676:return Ln;case 5124:case 35670:return Rn;case 35667:case 35671:return zn;case 35668:case 35672:return Bn;case 35669:case 35673:return Vn;case 5125:return Hn;case 36294:return Un;case 36295:return Wn;case 36296:return Gn;case 35678:case 36198:case 36298:case 36306:case 35682:return Kn;case 35679:case 36299:case 36307:return qn;case 35680:case 36300:case 36308:case 36293:return Jn;case 36289:case 36303:case 36311:case 36292:return Yn}}function Zn(e,t){e.uniform1fv(this.addr,t)}function Qn(e,t){let n=Dn(t,this.size,2);e.uniform2fv(this.addr,n)}function $n(e,t){let n=Dn(t,this.size,3);e.uniform3fv(this.addr,n)}function er(e,t){let n=Dn(t,this.size,4);e.uniform4fv(this.addr,n)}function tr(e,t){let n=Dn(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function nr(e,t){let n=Dn(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function rr(e,t){let n=Dn(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function ir(e,t){e.uniform1iv(this.addr,t)}function ar(e,t){e.uniform2iv(this.addr,t)}function or(e,t){e.uniform3iv(this.addr,t)}function sr(e,t){e.uniform4iv(this.addr,t)}function cr(e,t){e.uniform1uiv(this.addr,t)}function lr(e,t){e.uniform2uiv(this.addr,t)}function ur(e,t){e.uniform3uiv(this.addr,t)}function dr(e,t){e.uniform4uiv(this.addr,t)}function fr(e,t,n){let r=this.cache,i=t.length,a=An(n,i);On(r,a)||(e.uniform1iv(this.addr,a),kn(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?vn:_n;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function pr(e,t,n){let r=this.cache,i=t.length,a=An(n,i);On(r,a)||(e.uniform1iv(this.addr,a),kn(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||bn,a[e])}function mr(e,t,n){let r=this.cache,i=t.length,a=An(n,i);On(r,a)||(e.uniform1iv(this.addr,a),kn(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||xn,a[e])}function hr(e,t,n){let r=this.cache,i=t.length,a=An(n,i);On(r,a)||(e.uniform1iv(this.addr,a),kn(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||yn,a[e])}function gr(e){switch(e){case 5126:return Zn;case 35664:return Qn;case 35665:return $n;case 35666:return er;case 35674:return tr;case 35675:return nr;case 35676:return rr;case 5124:case 35670:return ir;case 35667:case 35671:return ar;case 35668:case 35672:return or;case 35669:case 35673:return sr;case 5125:return cr;case 36294:return lr;case 36295:return ur;case 36296:return dr;case 35678:case 36198:case 36298:case 36306:case 35682:return fr;case 35679:case 36299:case 36307:return pr;case 35680:case 36300:case 36308:case 36293:return mr;case 36289:case 36303:case 36311:case 36292:return hr}}var _r=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Xn(t.type)}},vr=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=gr(t.type)}},yr=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},br=/(\w+)(\])?(\[|\.)?/g;function xr(e,t){e.seq.push(t),e.map[t.id]=t}function Sr(e,t,n){let r=e.name,i=r.length;for(br.lastIndex=0;;){let a=br.exec(r),o=br.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){xr(n,l===void 0?new _r(s,e,t):new vr(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new yr(s),xr(n,e)),n=e}}}var Cr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Sr(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function wr(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Tr=37297,Er=0;function Dr(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Or=new H;function kr(e){Ie._getMatrix(Or,Ie.workingColorSpace,e);let t=`mat3( ${Or.elements.map(e=>e.toFixed(4))} )`;switch(Ie.getTransfer(e)){case Ze:return[t,`LinearTransferOETF`];case s:return[t,`sRGBTransferOETF`];default:return Fe(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Ar(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Dr(e.getShaderSource(t),r)}return i}function jr(e,t){let n=kr(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var Mr={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function Nr(e,t){let n=Mr[t];return n===void 0?(Fe(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Pr=new I;function Fr(){return Ie.getLuminanceCoefficients(Pr),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Pr.x.toFixed(4)}, ${Pr.y.toFixed(4)}, ${Pr.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Ir(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(zr).join(`
`)}function Lr(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Rr(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function zr(e){return e!==``}function Br(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Vr(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Hr=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ur(e){return e.replace(Hr,Gr)}var Wr=new Map;function Gr(e,t){let n=kt[t];if(n===void 0){let e=Wr.get(t);if(e!==void 0)n=kt[e],Fe(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`)}return Ur(n)}var Kr=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function qr(e){return e.replace(Kr,Jr)}function Jr(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Yr(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var Xr={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function Zr(e){return Xr[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var Qr={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function $r(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:Qr[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var ei={302:`ENVMAP_MODE_REFRACTION`};function ti(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:ei[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var ni={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function ri(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:ni[e.combine]||`ENVMAP_BLENDING_NONE`}function ii(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function ai(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Zr(n),l=$r(n),u=ti(n),d=ri(n),f=ii(n),p=Ir(n),m=Lr(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(zr).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(zr).join(`
`),_.length>0&&(_+=`
`)):(g=[Yr(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(zr).join(`
`),_=[Yr(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.numLightProbeGrids>0?`#define USE_LIGHT_PROBES_GRID`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:kt.tonemapping_pars_fragment,n.toneMapping===0?``:Nr(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,kt.colorspace_pars_fragment,jr(`linearToOutputTexel`,n.outputColorSpace),Fr(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(zr).join(`
`)),o=Ur(o),o=Br(o,n),o=Vr(o,n),s=Ur(s),s=Br(s,n),s=Vr(s,n),o=qr(o),s=qr(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=wr(i,i.VERTEX_SHADER,y),S=wr(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=Ar(i,x,`vertex`),n=Ar(i,S,`fragment`);$e(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):Fe(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new Cr(i,h),T=Rr(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Tr)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Er++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var oi=0,si=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new ci(e),t.set(e,n)),n}},ci=class{constructor(e){this.id=oi++,this.code=e,this.usedTimes=0}};function li(e){return e===1030||e===37490||e===36285}function ui(e,t,n,r,i,a){let o=new x,s=new si,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f=r.precision,p={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function m(e){return c.add(e),e===0?`uv`:`uv${e}`}function h(i,o,l,u,h,g){let _=u.fog,v=h.geometry,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,b=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,x=t.get(i.envMap||y,b),S=x&&x.mapping===306?x.image.height:null,C=p[i.type];i.precision!==null&&(f=r.getMaxPrecision(i.precision),f!==i.precision&&Fe(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,f,`instead.`));let w=v.morphAttributes.position||v.morphAttributes.normal||v.morphAttributes.color,T=w===void 0?0:w.length,E=0;v.morphAttributes.position!==void 0&&(E=1),v.morphAttributes.normal!==void 0&&(E=2),v.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=At[C];D=e.vertexShader,O=e.fragmentShader}else{D=i.vertexShader,O=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),k=e.id,A=t.id}let ee=e.getRenderTarget(),te=e.state.buffers.depth.getReversed(),j=h.isInstancedMesh===!0,M=h.isBatchedMesh===!0,N=!!i.map,ne=!!i.matcap,re=!!x,ie=!!i.aoMap,ae=!!i.lightMap,oe=!!i.bumpMap&&i.wireframe===!1,se=!!i.normalMap,ce=!!i.displacementMap,P=!!i.emissiveMap,le=!!i.metalnessMap,ue=!!i.roughnessMap,de=i.anisotropy>0,fe=i.clearcoat>0,pe=i.dispersion>0,me=i.retroreflectivity>0,he=i.iridescence>0,F=i.sheen>0,ge=i.transmission>0,_e=de&&!!i.anisotropyMap,I=fe&&!!i.clearcoatMap,L=fe&&!!i.clearcoatNormalMap,ve=fe&&!!i.clearcoatRoughnessMap,ye=he&&!!i.iridescenceMap,be=he&&!!i.iridescenceThicknessMap,xe=F&&!!i.sheenColorMap,Se=F&&!!i.sheenRoughnessMap,Ce=!!i.specularMap,we=!!i.specularColorMap,Te=!!i.specularIntensityMap,Ee=ge&&!!i.transmissionMap,De=ge&&!!i.thicknessMap,Oe=!!i.gradientMap,ke=!!i.alphaMap,Ae=i.alphaTest>0,je=!!i.alphaHash,Me=!!i.extensions,Ne=0;i.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(Ne=e.toneMapping);let Pe={shaderID:C,shaderType:i.type,shaderName:i.name,vertexShader:D,fragmentShader:O,defines:i.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:f,batching:M,batchingColor:M&&h._colorsTexture!==null,instancing:j,instancingColor:j&&h.instanceColor!==null,instancingMorph:j&&h.morphTexture!==null,outputColorSpace:ee===null?e.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:Ie.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:N,matcap:ne,envMap:re,envMapMode:re&&x.mapping,envMapCubeUVHeight:S,aoMap:ie,lightMap:ae,bumpMap:oe,normalMap:se,displacementMap:ce,emissiveMap:P,normalMapObjectSpace:se&&i.normalMapType===1,normalMapTangentSpace:se&&i.normalMapType===0,packedNormalMap:se&&i.normalMapType===0&&li(i.normalMap.format),metalnessMap:le,roughnessMap:ue,anisotropy:de,anisotropyMap:_e,clearcoat:fe,clearcoatMap:I,clearcoatNormalMap:L,clearcoatRoughnessMap:ve,dispersion:pe,retroreflection:me,iridescence:he,iridescenceMap:ye,iridescenceThicknessMap:be,sheen:F,sheenColorMap:xe,sheenRoughnessMap:Se,specularMap:Ce,specularColorMap:we,specularIntensityMap:Te,transmission:ge,transmissionMap:Ee,thicknessMap:De,gradientMap:Oe,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:ke,alphaTest:Ae,alphaHash:je,combine:i.combine,mapUv:N&&m(i.map.channel),aoMapUv:ie&&m(i.aoMap.channel),lightMapUv:ae&&m(i.lightMap.channel),bumpMapUv:oe&&m(i.bumpMap.channel),normalMapUv:se&&m(i.normalMap.channel),displacementMapUv:ce&&m(i.displacementMap.channel),emissiveMapUv:P&&m(i.emissiveMap.channel),metalnessMapUv:le&&m(i.metalnessMap.channel),roughnessMapUv:ue&&m(i.roughnessMap.channel),anisotropyMapUv:_e&&m(i.anisotropyMap.channel),clearcoatMapUv:I&&m(i.clearcoatMap.channel),clearcoatNormalMapUv:L&&m(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ve&&m(i.clearcoatRoughnessMap.channel),iridescenceMapUv:ye&&m(i.iridescenceMap.channel),iridescenceThicknessMapUv:be&&m(i.iridescenceThicknessMap.channel),sheenColorMapUv:xe&&m(i.sheenColorMap.channel),sheenRoughnessMapUv:Se&&m(i.sheenRoughnessMap.channel),specularMapUv:Ce&&m(i.specularMap.channel),specularColorMapUv:we&&m(i.specularColorMap.channel),specularIntensityMapUv:Te&&m(i.specularIntensityMap.channel),transmissionMapUv:Ee&&m(i.transmissionMap.channel),thicknessMapUv:De&&m(i.thicknessMap.channel),alphaMapUv:ke&&m(i.alphaMap.channel),vertexTangents:!!v.attributes.tangent&&(se||de),vertexNormals:!!v.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!v.attributes.color&&v.attributes.color.itemSize===4,pointsUvs:h.isPoints===!0&&!!v.attributes.uv&&(N||ke),fog:!!_,useFog:i.fog===!0,fogExp2:!!_&&_.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||v.attributes.normal===void 0&&se===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:te,skinning:h.isSkinnedMesh===!0,hasPositionAttribute:v.attributes.position!==void 0,morphTargets:v.morphAttributes.position!==void 0,morphNormals:v.morphAttributes.normal!==void 0,morphColors:v.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:g.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ne,decodeVideoTexture:N&&i.map.isVideoTexture===!0&&Ie.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:P&&i.emissiveMap.isVideoTexture===!0&&Ie.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Me&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Me&&i.extensions.multiDraw===!0||M)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Pe.vertexUv1s=c.has(1),Pe.vertexUv2s=c.has(2),Pe.vertexUv3s=c.has(3),c.clear(),Pe}function g(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(_(n,t),v(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function _(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function v(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function y(e){let t=p[e.type],n;if(t){let e=At[t];n=fe.clone(e.uniforms)}else n=e.uniforms;return n}function b(t,n){let r=u.get(n);return r===void 0?(r=new ai(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function S(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function C(e){s.remove(e)}function w(){s.dispose()}return{getParameters:h,getProgramCacheKey:g,getUniforms:y,acquireProgram:b,releaseProgram:S,releaseShaderCache:C,programs:l,dispose:w}}function di(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function fi(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function pi(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function mi(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||fi),r.length>1&&r.sort(t||pi),i.length>1&&i.sort(t||pi)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function hi(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new mi,e.set(t,[i])):n>=r.length?(i=new mi,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function gi(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new I,color:new B};break;case`SpotLight`:n={position:new I,direction:new I,color:new B,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new I,color:new B,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new I,skyColor:new B,groundColor:new B};break;case`RectAreaLight`:n={color:new B,position:new I,halfWidth:new I,halfHeight:new I}}return e[t.id]=n,n}}}function _i(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new F};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new F};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new F,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var vi=0;function yi(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function bi(e){let t=new gi,n=_i(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new I);let i=new I,a=new xe,o=new xe;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(yi);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=G.LTC_FLOAT_1,r.rectAreaLTC2=G.LTC_FLOAT_2):(r.rectAreaLTC1=G.LTC_HALF_1,r.rectAreaLTC2=G.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=vi++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function xi(e){let t=new bi(e),n=[],r=[],i=[];function a(e){d.camera=e,n.length=0,r.length=0,i.length=0}function o(e){n.push(e)}function s(e){r.push(e)}function c(e){i.push(e)}function l(){t.setup(n)}function u(e){t.setupView(n,e)}let d={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:s,pushLightProbeGrid:c}}function Si(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new xi(e),t.set(n,[a])):r>=i.length?(a=new xi(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Ci=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,wi=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Ti=[new I(1,0,0),new I(-1,0,0),new I(0,1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1)],Ei=[new I(0,-1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1),new I(0,-1,0),new I(0,-1,0)],Di=new xe,Oi=new I,ki=new I;function Ai(e,t,n){let r=new w,a=new F,o=new F,s=new re,c=new Ee,u=new Ke,d={},f=n.maxTextureSize,p={0:1,1:0,2:2},h=new P({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new F},radius:{value:4}},vertexShader:Ci,fragmentShader:wi}),g=h.clone();g.defines.HORIZONTAL_PASS=1;let _=new we;_.setAttribute(`position`,new st(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new U(_,h),y=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let b=this.type;this.render=function(t,n,c){if(y.enabled===!1||y.autoUpdate===!1&&y.needsUpdate===!1||t.length===0)return;this.type===2&&(Fe(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),h=e.state;h.setBlending(0),h.buffers.depth.getReversed()===!0?h.buffers.color.setClear(0,0,0,0):h.buffers.color.setClear(1,1,1,1),h.buffers.depth.setTest(!0),h.setScissorTest(!1);let g=b!==this.type;g&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let u=0,d=t.length;u<d;u++){let d=t[u],p=d.shadow;if(p===void 0){Fe(`WebGLShadowMap:`,d,`has no shadow.`);continue}if(p.autoUpdate===!1&&p.needsUpdate===!1)continue;a.copy(p.mapSize);let _=p.getFrameExtents();a.multiply(_),o.copy(p.mapSize),(a.x>f||a.y>f)&&(a.x>f&&(o.x=Math.floor(f/_.x),a.x=o.x*_.x,p.mapSize.x=o.x),a.y>f&&(o.y=Math.floor(f/_.y),a.y=o.y*_.y,p.mapSize.y=o.y));let v=e.state.buffers.depth.getReversed();if(p.camera._reversedDepth=v,p.map===null||g===!0){if(p.map!==null&&(p.map.depthTexture!==null&&(p.map.depthTexture.dispose(),p.map.depthTexture=null),p.map.dispose()),this.type===3){if(d.isPointLight){Fe(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}p.map=new je(a.x,a.y,{format:We,type:i,minFilter:ne,magFilter:ne,generateMipmaps:!1}),p.map.texture.name=d.name+`.shadowMap`,p.map.depthTexture=new l(a.x,a.y,m),p.map.depthTexture.name=d.name+`.shadowMapDepth`,p.map.depthTexture.format=ce,p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=Ye,p.map.depthTexture.magFilter=Ye}else d.isPointLight?(p.map=new sn(a.x),p.map.depthTexture=new St(a.x,C)):(p.map=new je(a.x,a.y),p.map.depthTexture=new l(a.x,a.y,C)),p.map.depthTexture.name=d.name+`.shadowMap`,p.map.depthTexture.format=ce,this.type===1?(p.map.depthTexture.compareFunction=v?518:515,p.map.depthTexture.minFilter=ne,p.map.depthTexture.magFilter=ne):(p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=Ye,p.map.depthTexture.magFilter=Ye);p.camera.updateProjectionMatrix()}p.map.isWebGLCubeRenderTarget!==!0&&(p.map.width!==a.x||p.map.height!==a.y)&&p.map.setSize(a.x,a.y);let y=p.map.isWebGLCubeRenderTarget?6:p.getViewportCount();d.isPointLight!==!0&&p.updateMatrices(d,c);for(let t=0;t<y;t++){let i=p.getCamera(t);if(d.isPointLight){let e=p.camera,n=p.matrix,r=d.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Oi.setFromMatrixPosition(d.matrixWorld),e.position.copy(Oi),ki.copy(e.position),ki.add(Ti[t]),e.up.copy(Ei[t]),e.lookAt(ki),e.updateMatrixWorld(),n.makeTranslation(-Oi.x,-Oi.y,-Oi.z),Di.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),p._frustum.setFromProjectionMatrix(Di,e.coordinateSystem,e.reversedDepth)}if(p.map.isWebGLCubeRenderTarget)e.setRenderTarget(p.map,t),e.clear();else{t===0&&(e.setRenderTarget(p.map),e.clear());let n=p.getViewport(t);s.set(o.x*n.x,o.y*n.y,o.x*n.z,o.y*n.w),h.viewport(s)}r=p.getFrustum(t),T(n,c,i,d,this.type)}p.isPointLightShadow!==!0&&this.type===3&&x(p,c),p.needsUpdate=!1}b=this.type,y.needsUpdate=!1,e.setRenderTarget(u,d,p)};function x(n,r){let o=t.update(v);h.defines.VSM_SAMPLES!==n.blurSamples&&(h.defines.VSM_SAMPLES=n.blurSamples,g.defines.VSM_SAMPLES=n.blurSamples,h.needsUpdate=!0,g.needsUpdate=!0),n.mapPass===null?n.mapPass=new je(a.x,a.y,{format:We,type:i}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),h.uniforms.shadow_pass.value=n.map.depthTexture,h.uniforms.resolution.value.set(n.map.width,n.map.height),h.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,o,h,v,null),g.uniforms.shadow_pass.value=n.mapPass.texture,g.uniforms.resolution.value.set(n.map.width,n.map.height),g.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,o,g,v,null)}function S(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?u:c,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=d[e];r===void 0&&(r={},d[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,E)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?p[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function T(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=S(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=S(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)T(c[e],i,a,o,s)}function E(e){e.target.removeEventListener(`dispose`,E);for(let t in d){let n=d[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function ji(e,t){function n(){let t=!1,n=new re,r=null,i=new re(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?ue(e.DEPTH_TEST):de(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=z[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?ue(e.STENCIL_TEST):de(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new B(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,ee=null,te=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),j=!1,M=0,N=e.getParameter(e.VERSION);N.indexOf(`WebGL`)===-1?N.indexOf(`OpenGL ES`)!==-1&&(M=parseFloat(/^OpenGL ES (\d)/.exec(N)[1]),j=M>=2):(M=parseFloat(/^WebGL (\d)/.exec(N)[1]),j=M>=1);let ne=null,ie={},ae=e.getParameter(e.SCISSOR_BOX),oe=e.getParameter(e.VIEWPORT),se=new re().fromArray(ae),ce=new re().fromArray(oe);function P(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let le={};le[e.TEXTURE_2D]=P(e.TEXTURE_2D,e.TEXTURE_2D,1),le[e.TEXTURE_CUBE_MAP]=P(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),le[e.TEXTURE_2D_ARRAY]=P(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),le[e.TEXTURE_3D]=P(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),ue(e.DEPTH_TEST),o.setFunc(3),I(!1),L(1),ue(e.CULL_FACE),ge(0);function ue(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function de(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function fe(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function pe(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function me(t){return h!==t&&(e.useProgram(t),h=t,!0)}let he={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};he[103]=e.MIN,he[104]=e.MAX;let F={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function ge(t,n,r,i,a,o,s,c,l,u){if(t===0){g===!0&&(de(e.BLEND),g=!1);return}if(g===!1&&(ue(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:$e(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:$e(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:$e(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:$e(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}return}a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(he[n],he[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(F[r],F[i],F[o],F[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function _e(t,n){t.side===2?de(e.CULL_FACE):ue(e.CULL_FACE);let r=t.side===1;n&&(r=!r),I(r),t.blending===1&&t.transparent===!1?ge(0):ge(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),ye(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?ue(e.SAMPLE_ALPHA_TO_COVERAGE):de(e.SAMPLE_ALPHA_TO_COVERAGE)}function I(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function L(t){t===0?de(e.CULL_FACE):(ue(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function ve(t){t!==k&&(j&&e.lineWidth(t),k=t)}function ye(t,n,r){t?(ue(e.POLYGON_OFFSET_FILL),(A!==n||ee!==r)&&(A=n,ee=r,o.getReversed()&&(n=-n),e.polygonOffset(n,r))):de(e.POLYGON_OFFSET_FILL)}function be(t){t?ue(e.SCISSOR_TEST):de(e.SCISSOR_TEST)}function xe(t){t===void 0&&(t=e.TEXTURE0+te-1),ne!==t&&(e.activeTexture(t),ne=t)}function Se(t,n,r){r===void 0&&(r=ne===null?e.TEXTURE0+te-1:ne);let i=ie[r];i===void 0&&(i={type:void 0,texture:void 0},ie[r]=i),(i.type!==t||i.texture!==n)&&(ne!==r&&(e.activeTexture(r),ne=r),e.bindTexture(t,n||le[t]),i.type=t,i.texture=n)}function Ce(){let t=ie[ne];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function we(){try{e.compressedTexImage2D(...arguments)}catch(e){$e(`WebGLState:`,e)}}function Te(){try{e.compressedTexImage3D(...arguments)}catch(e){$e(`WebGLState:`,e)}}function Ee(){try{e.texSubImage2D(...arguments)}catch(e){$e(`WebGLState:`,e)}}function De(){try{e.texSubImage3D(...arguments)}catch(e){$e(`WebGLState:`,e)}}function Oe(){try{e.compressedTexSubImage2D(...arguments)}catch(e){$e(`WebGLState:`,e)}}function ke(){try{e.compressedTexSubImage3D(...arguments)}catch(e){$e(`WebGLState:`,e)}}function Ae(){try{e.texStorage2D(...arguments)}catch(e){$e(`WebGLState:`,e)}}function je(){try{e.texStorage3D(...arguments)}catch(e){$e(`WebGLState:`,e)}}function Me(){try{e.texImage2D(...arguments)}catch(e){$e(`WebGLState:`,e)}}function Ne(){try{e.texImage3D(...arguments)}catch(e){$e(`WebGLState:`,e)}}function Pe(t){return d[t]===void 0?e.getParameter(t):d[t]}function Fe(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function R(t){se.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),se.copy(t))}function Ie(t){ce.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ce.copy(t))}function Le(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Re(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function ze(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},ne=null,ie={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new B(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,ee=null,se.set(0,0,e.canvas.width,e.canvas.height),ce.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:ue,disable:de,bindFramebuffer:fe,drawBuffers:pe,useProgram:me,setBlending:ge,setMaterial:_e,setFlipSided:I,setCullFace:L,setLineWidth:ve,setPolygonOffset:ye,setScissorTest:be,activeTexture:xe,bindTexture:Se,unbindTexture:Ce,compressedTexImage2D:we,compressedTexImage3D:Te,texImage2D:Me,texImage3D:Ne,pixelStorei:Fe,getParameter:Pe,updateUBOMapping:Le,uniformBlockBinding:Re,texStorage2D:Ae,texStorage3D:je,texSubImage2D:Ee,texSubImage3D:De,compressedTexSubImage2D:Oe,compressedTexSubImage3D:ke,scissor:R,viewport:Ie,reset:ze}}function Mi(t,n,r,i,a,o,s){let c=n.has(`WEBGL_multisampled_render_to_texture`)?n.get(`WEBGL_multisampled_render_to_texture`):null,l=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),u=new F,f=new WeakMap,p=new Set,m,h=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function _(e,t){return g?new OffscreenCanvas(e,t):be(`canvas`)}function v(e,t,n){let r=1,i=Oe(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);m===void 0&&(m=_(n,a));let o=t?_(n,a):m;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),Fe(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&Fe(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function y(e){return e.generateMipmaps}function b(e){t.generateMipmap(e)}function x(e){return e.isWebGLCubeRenderTarget?t.TEXTURE_CUBE_MAP:e.isWebGL3DRenderTarget?t.TEXTURE_3D:e.isWebGLArrayRenderTarget||e.isCompressedArrayTexture?t.TEXTURE_2D_ARRAY:t.TEXTURE_2D}function S(e,r,i,a,o,s=!1){if(e!==null){if(t[e]!==void 0)return t[e];Fe(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+e+`'`)}let c;a&&(c=n.get(`EXT_texture_norm16`),c||Fe(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===t.RED&&(i===t.FLOAT&&(l=t.R32F),i===t.HALF_FLOAT&&(l=t.R16F),i===t.UNSIGNED_BYTE&&(l=t.R8),i===t.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===t.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===t.RED_INTEGER&&(i===t.UNSIGNED_BYTE&&(l=t.R8UI),i===t.UNSIGNED_SHORT&&(l=t.R16UI),i===t.UNSIGNED_INT&&(l=t.R32UI),i===t.BYTE&&(l=t.R8I),i===t.SHORT&&(l=t.R16I),i===t.INT&&(l=t.R32I)),r===t.RG&&(i===t.FLOAT&&(l=t.RG32F),i===t.HALF_FLOAT&&(l=t.RG16F),i===t.UNSIGNED_BYTE&&(l=t.RG8),i===t.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===t.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===t.RG_INTEGER&&(i===t.UNSIGNED_BYTE&&(l=t.RG8UI),i===t.UNSIGNED_SHORT&&(l=t.RG16UI),i===t.UNSIGNED_INT&&(l=t.RG32UI),i===t.BYTE&&(l=t.RG8I),i===t.SHORT&&(l=t.RG16I),i===t.INT&&(l=t.RG32I)),r===t.RGB_INTEGER&&(i===t.UNSIGNED_BYTE&&(l=t.RGB8UI),i===t.UNSIGNED_SHORT&&(l=t.RGB16UI),i===t.UNSIGNED_INT&&(l=t.RGB32UI),i===t.BYTE&&(l=t.RGB8I),i===t.SHORT&&(l=t.RGB16I),i===t.INT&&(l=t.RGB32I)),r===t.RGBA_INTEGER&&(i===t.UNSIGNED_BYTE&&(l=t.RGBA8UI),i===t.UNSIGNED_SHORT&&(l=t.RGBA16UI),i===t.UNSIGNED_INT&&(l=t.RGBA32UI),i===t.BYTE&&(l=t.RGBA8I),i===t.SHORT&&(l=t.RGBA16I),i===t.INT&&(l=t.RGBA32I)),r===t.RGB&&(i===t.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===t.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===t.UNSIGNED_INT_5_9_9_9_REV&&(l=t.RGB9_E5),i===t.UNSIGNED_INT_10F_11F_11F_REV&&(l=t.R11F_G11F_B10F)),r===t.RGBA){let e=s?Ze:Ie.getTransfer(o);i===t.FLOAT&&(l=t.RGBA32F),i===t.HALF_FLOAT&&(l=t.RGBA16F),i===t.UNSIGNED_BYTE&&(l=e===`srgb`?t.SRGB8_ALPHA8:t.RGBA8),i===t.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===t.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===t.UNSIGNED_SHORT_4_4_4_4&&(l=t.RGBA4),i===t.UNSIGNED_SHORT_5_5_5_1&&(l=t.RGB5_A1)}return(l===t.R16F||l===t.R32F||l===t.RG16F||l===t.RG32F||l===t.RGBA16F||l===t.RGBA32F)&&n.get(`EXT_color_buffer_float`),l}function C(e,n){let r;return e?n===null||n===1014||n===1020?r=t.DEPTH24_STENCIL8:n===1015?r=t.DEPTH32F_STENCIL8:n===1012&&(r=t.DEPTH24_STENCIL8,Fe(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=t.DEPTH_COMPONENT24:n===1015?r=t.DEPTH_COMPONENT32F:n===1012&&(r=t.DEPTH_COMPONENT16),r}function w(e,t){return y(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function T(e){let t=e.target;t.removeEventListener(`dispose`,T),D(t),t.isVideoTexture&&f.delete(t),t.isHTMLTexture&&p.delete(t)}function E(e){let t=e.target;t.removeEventListener(`dispose`,E),k(t)}function D(e){let t=i.get(e);if(t.__webglInit===void 0)return;let n=e.source,r=h.get(n);if(r){let i=r[t.__cacheKey];i.usedTimes--,i.usedTimes===0&&O(e),Object.keys(r).length===0&&h.delete(n)}i.remove(e)}function O(e){let n=i.get(e);t.deleteTexture(n.__webglTexture);let r=e.source,a=h.get(r);delete a[n.__cacheKey],s.memory.textures--}function k(e){let n=i.get(e);if(e.depthTexture&&(e.depthTexture.dispose(),i.remove(e.depthTexture)),e.isWebGLCubeRenderTarget)for(let e=0;e<6;e++){if(Array.isArray(n.__webglFramebuffer[e]))for(let r=0;r<n.__webglFramebuffer[e].length;r++)t.deleteFramebuffer(n.__webglFramebuffer[e][r]);else t.deleteFramebuffer(n.__webglFramebuffer[e]);n.__webglDepthbuffer&&t.deleteRenderbuffer(n.__webglDepthbuffer[e])}else{if(Array.isArray(n.__webglFramebuffer))for(let e=0;e<n.__webglFramebuffer.length;e++)t.deleteFramebuffer(n.__webglFramebuffer[e]);else t.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&t.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&t.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let e=0;e<n.__webglColorRenderbuffer.length;e++)n.__webglColorRenderbuffer[e]&&t.deleteRenderbuffer(n.__webglColorRenderbuffer[e]);n.__webglDepthRenderbuffer&&t.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let r=e.textures;for(let e=0,n=r.length;e<n;e++){let n=i.get(r[e]);n.__webglTexture&&(t.deleteTexture(n.__webglTexture),s.memory.textures--),i.remove(r[e])}i.remove(e)}let A=0;function ee(){A=0}function te(){return A}function j(e){A=e}function M(){let e=A;return e>=a.maxTextures&&Fe(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+a.maxTextures),A+=1,e}function N(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function re(e,n){let a=i.get(e);if(e.isVideoTexture&&Ee(e),e.isRenderTargetTexture===!1&&e.isExternalTexture!==!0&&e.version>0&&a.__version!==e.version){let t=e.image;if(t===null)Fe(`WebGLRenderer: Texture marked for update but no image data found.`);else if(t.complete===!1)Fe(`WebGLRenderer: Texture marked for update but image is incomplete`);else{pe(a,e,n);return}}else e.isExternalTexture&&(a.__webglTexture=e.sourceTexture?e.sourceTexture:null);r.bindTexture(t.TEXTURE_2D,a.__webglTexture,t.TEXTURE0+n)}function ie(e,n){let a=i.get(e);if(e.isRenderTargetTexture===!1&&e.version>0&&a.__version!==e.version){pe(a,e,n);return}e.isExternalTexture&&(a.__webglTexture=e.sourceTexture?e.sourceTexture:null),r.bindTexture(t.TEXTURE_2D_ARRAY,a.__webglTexture,t.TEXTURE0+n)}function ae(e,n){let a=i.get(e);if(e.isRenderTargetTexture===!1&&e.version>0&&a.__version!==e.version){pe(a,e,n);return}r.bindTexture(t.TEXTURE_3D,a.__webglTexture,t.TEXTURE0+n)}function oe(e,n){let a=i.get(e);if(e.isCubeDepthTexture!==!0&&e.version>0&&a.__version!==e.version){me(a,e,n);return}r.bindTexture(t.TEXTURE_CUBE_MAP,a.__webglTexture,t.TEXTURE0+n)}let se={[Re]:t.REPEAT,[qe]:t.CLAMP_TO_EDGE,[nt]:t.MIRRORED_REPEAT},ce={[Ye]:t.NEAREST,[Le]:t.NEAREST_MIPMAP_NEAREST,[ze]:t.NEAREST_MIPMAP_LINEAR,[ne]:t.LINEAR,[Me]:t.LINEAR_MIPMAP_NEAREST,[e]:t.LINEAR_MIPMAP_LINEAR},P={512:t.NEVER,519:t.ALWAYS,513:t.LESS,515:t.LEQUAL,514:t.EQUAL,518:t.GEQUAL,516:t.GREATER,517:t.NOTEQUAL};function le(e,r){if(r.type===1015&&n.has(`OES_texture_float_linear`)===!1&&(r.magFilter===1006||r.magFilter===1007||r.magFilter===1005||r.magFilter===1008||r.minFilter===1006||r.minFilter===1007||r.minFilter===1005||r.minFilter===1008)&&Fe(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),t.texParameteri(e,t.TEXTURE_WRAP_S,se[r.wrapS]),t.texParameteri(e,t.TEXTURE_WRAP_T,se[r.wrapT]),(e===t.TEXTURE_3D||e===t.TEXTURE_2D_ARRAY)&&t.texParameteri(e,t.TEXTURE_WRAP_R,se[r.wrapR]),t.texParameteri(e,t.TEXTURE_MAG_FILTER,ce[r.magFilter]),t.texParameteri(e,t.TEXTURE_MIN_FILTER,ce[r.minFilter]),r.compareFunction&&(t.texParameteri(e,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE),t.texParameteri(e,t.TEXTURE_COMPARE_FUNC,P[r.compareFunction])),n.has(`EXT_texture_filter_anisotropic`)===!0){if(r.magFilter===1003||r.minFilter!==1005&&r.minFilter!==1008||r.type===1015&&n.has(`OES_texture_float_linear`)===!1)return;if(r.anisotropy>1||i.get(r).__currentAnisotropy){let o=n.get(`EXT_texture_filter_anisotropic`);t.texParameterf(e,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(r.anisotropy,a.getMaxAnisotropy())),i.get(r).__currentAnisotropy=r.anisotropy}}}function ue(e,n){let r=!1;e.__webglInit===void 0&&(e.__webglInit=!0,n.addEventListener(`dispose`,T));let i=n.source,a=h.get(i);a===void 0&&(a={},h.set(i,a));let o=N(n);if(o!==e.__cacheKey){a[o]===void 0&&(a[o]={texture:t.createTexture(),usedTimes:0},s.memory.textures++,r=!0),a[o].usedTimes++;let i=a[e.__cacheKey];i!==void 0&&(a[e.__cacheKey].usedTimes--,i.usedTimes===0&&O(n)),e.__cacheKey=o,e.__webglTexture=a[o].texture}return r}function de(e,t,n){return Math.floor(Math.floor(e/n)/t)}function fe(e,n,i,a){let o=e.updateRanges;if(o.length===0)r.texSubImage2D(t.TEXTURE_2D,0,0,0,n.width,n.height,i,a,n.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],r=o[e],i=t.start+t.count,a=de(r.start,n.width,4),c=de(t.start,n.width,4);r.start<=i+1&&a===c&&de(r.start+r.count-1,n.width,4)===a?t.count=Math.max(t.count,r.start+r.count-t.start):(++s,o[s]=r)}o.length=s+1;let c=r.getParameter(t.UNPACK_ROW_LENGTH),l=r.getParameter(t.UNPACK_SKIP_PIXELS),u=r.getParameter(t.UNPACK_SKIP_ROWS);r.pixelStorei(t.UNPACK_ROW_LENGTH,n.width);for(let e=0,s=o.length;e<s;e++){let s=o[e],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%n.width,d=Math.floor(c/n.width),f=l;r.pixelStorei(t.UNPACK_SKIP_PIXELS,u),r.pixelStorei(t.UNPACK_SKIP_ROWS,d),r.texSubImage2D(t.TEXTURE_2D,0,u,d,f,1,i,a,n.data)}e.clearUpdateRanges(),r.pixelStorei(t.UNPACK_ROW_LENGTH,c),r.pixelStorei(t.UNPACK_SKIP_PIXELS,l),r.pixelStorei(t.UNPACK_SKIP_ROWS,u)}}function pe(e,n,s){let c=t.TEXTURE_2D;(n.isDataArrayTexture||n.isCompressedArrayTexture)&&(c=t.TEXTURE_2D_ARRAY),n.isData3DTexture&&(c=t.TEXTURE_3D);let l=ue(e,n),u=n.source;r.bindTexture(c,e.__webglTexture,t.TEXTURE0+s);let f=i.get(u);if(u.version!==f.__version||l===!0){if(r.activeTexture(t.TEXTURE0+s),!(typeof ImageBitmap<`u`&&n.image instanceof ImageBitmap)){let e=Ie.getPrimaries(Ie.workingColorSpace),i=n.colorSpace===``?null:Ie.getPrimaries(n.colorSpace),a=n.colorSpace===``||e===i?t.NONE:t.BROWSER_DEFAULT_WEBGL;r.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,n.flipY),r.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,n.premultiplyAlpha),r.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,a)}r.pixelStorei(t.UNPACK_ALIGNMENT,n.unpackAlignment);let e=v(n.image,!1,a.maxTextureSize);e=De(n,e);let i=o.convert(n.format,n.colorSpace),m=o.convert(n.type),h=S(n.internalFormat,i,m,n.normalized,n.colorSpace,n.isVideoTexture);le(c,n);let g,_=n.mipmaps,x=n.isVideoTexture!==!0,T=f.__version===void 0||l===!0,E=u.dataReady,D=w(n,e);if(n.isDepthTexture)h=C(n.format===d,n.type),T&&(x?r.texStorage2D(t.TEXTURE_2D,1,h,e.width,e.height):r.texImage2D(t.TEXTURE_2D,0,h,e.width,e.height,0,i,m,null));else if(n.isDataTexture){if(_.length>0){x&&T&&r.texStorage2D(t.TEXTURE_2D,D,h,_[0].width,_[0].height);for(let e=0,n=_.length;e<n;e++)g=_[e],x?E&&r.texSubImage2D(t.TEXTURE_2D,e,0,0,g.width,g.height,i,m,g.data):r.texImage2D(t.TEXTURE_2D,e,h,g.width,g.height,0,i,m,g.data);n.generateMipmaps=!1}else x?(T&&r.texStorage2D(t.TEXTURE_2D,D,h,e.width,e.height),E&&fe(n,e,i,m)):r.texImage2D(t.TEXTURE_2D,0,h,e.width,e.height,0,i,m,e.data)}else if(n.isCompressedTexture){if(n.isCompressedArrayTexture){x&&T&&r.texStorage3D(t.TEXTURE_2D_ARRAY,D,h,_[0].width,_[0].height,e.depth);for(let a=0,o=_.length;a<o;a++)if(g=_[a],n.format!==1023){if(i!==null){if(x){if(E){if(n.layerUpdates.size>0){let e=ct(g.width,g.height,n.format,n.type);for(let o of n.layerUpdates){let n=g.data.subarray(o*e/g.data.BYTES_PER_ELEMENT,(o+1)*e/g.data.BYTES_PER_ELEMENT);r.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,a,0,0,o,g.width,g.height,1,i,n)}}else r.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,a,0,0,0,g.width,g.height,e.depth,i,g.data)}}else r.compressedTexImage3D(t.TEXTURE_2D_ARRAY,a,h,g.width,g.height,e.depth,0,g.data,0,0)}else Fe(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else x?E&&r.texSubImage3D(t.TEXTURE_2D_ARRAY,a,0,0,0,g.width,g.height,e.depth,i,m,g.data):r.texImage3D(t.TEXTURE_2D_ARRAY,a,h,g.width,g.height,e.depth,0,i,m,g.data);n.layerUpdates.size>0&&n.clearLayerUpdates()}else{x&&T&&r.texStorage2D(t.TEXTURE_2D,D,h,_[0].width,_[0].height);for(let e=0,a=_.length;e<a;e++)g=_[e],n.format===1023?x?E&&r.texSubImage2D(t.TEXTURE_2D,e,0,0,g.width,g.height,i,m,g.data):r.texImage2D(t.TEXTURE_2D,e,h,g.width,g.height,0,i,m,g.data):i===null?Fe(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):x?E&&r.compressedTexSubImage2D(t.TEXTURE_2D,e,0,0,g.width,g.height,i,g.data):r.compressedTexImage2D(t.TEXTURE_2D,e,h,g.width,g.height,0,g.data)}}else if(n.isDataArrayTexture){if(x){if(T&&r.texStorage3D(t.TEXTURE_2D_ARRAY,D,h,e.width,e.height,e.depth),E){if(n.layerUpdates.size>0){let a=ct(e.width,e.height,n.format,n.type);for(let o of n.layerUpdates){let n=e.data.subarray(o*a/e.data.BYTES_PER_ELEMENT,(o+1)*a/e.data.BYTES_PER_ELEMENT);r.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,o,e.width,e.height,1,i,m,n)}n.clearLayerUpdates()}else r.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,0,e.width,e.height,e.depth,i,m,e.data)}}else r.texImage3D(t.TEXTURE_2D_ARRAY,0,h,e.width,e.height,e.depth,0,i,m,e.data)}else if(n.isData3DTexture)x?(T&&r.texStorage3D(t.TEXTURE_3D,D,h,e.width,e.height,e.depth),E&&r.texSubImage3D(t.TEXTURE_3D,0,0,0,0,e.width,e.height,e.depth,i,m,e.data)):r.texImage3D(t.TEXTURE_3D,0,h,e.width,e.height,e.depth,0,i,m,e.data);else if(n.isFramebufferTexture){if(T){if(x)r.texStorage2D(t.TEXTURE_2D,D,h,e.width,e.height);else{let n=e.width,a=e.height;for(let e=0;e<D;e++)r.texImage2D(t.TEXTURE_2D,e,h,n,a,0,i,m,null),n>>=1,a>>=1}}}else if(n.isHTMLTexture){if(`texElementImage2D`in t){let r=t.canvas;if(r.hasAttribute(`layoutsubtree`)||r.setAttribute(`layoutsubtree`,`true`),e.parentNode!==r){r.appendChild(e),p.add(n),r.onpaint=e=>{let t=e.changedElements;for(let e of p)t.includes(e.image)&&(e.needsUpdate=!0)},r.requestPaint();return}if(t.texElementImage2D.length===3)t.texElementImage2D(t.TEXTURE_2D,t.RGBA8,e);else{let n=t.RGBA,r=t.RGBA,i=t.UNSIGNED_BYTE;t.texElementImage2D(t.TEXTURE_2D,0,n,r,i,e)}t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE)}}else if(_.length>0){if(x&&T){let e=Oe(_[0]);r.texStorage2D(t.TEXTURE_2D,D,h,e.width,e.height)}for(let e=0,n=_.length;e<n;e++)g=_[e],x?E&&r.texSubImage2D(t.TEXTURE_2D,e,0,0,i,m,g):r.texImage2D(t.TEXTURE_2D,e,h,i,m,g);n.generateMipmaps=!1}else if(x){if(T){let n=Oe(e);r.texStorage2D(t.TEXTURE_2D,D,h,n.width,n.height)}E&&r.texSubImage2D(t.TEXTURE_2D,0,0,0,i,m,e)}else r.texImage2D(t.TEXTURE_2D,0,h,i,m,e);y(n)&&b(c),f.__version=u.version,n.onUpdate&&n.onUpdate(n)}e.__version=n.version}function me(e,n,s){if(n.image.length!==6)return;let c=ue(e,n),l=n.source;r.bindTexture(t.TEXTURE_CUBE_MAP,e.__webglTexture,t.TEXTURE0+s);let u=i.get(l);if(l.version!==u.__version||c===!0){r.activeTexture(t.TEXTURE0+s);let e=Ie.getPrimaries(Ie.workingColorSpace),i=n.colorSpace===``?null:Ie.getPrimaries(n.colorSpace),d=n.colorSpace===``||e===i?t.NONE:t.BROWSER_DEFAULT_WEBGL;r.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,n.flipY),r.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,n.premultiplyAlpha),r.pixelStorei(t.UNPACK_ALIGNMENT,n.unpackAlignment),r.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=n.isCompressedTexture||n.image[0].isCompressedTexture,p=n.image[0]&&n.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=v(n.image[e],!0,a.maxCubemapSize):m[e]=p?n.image[e].image:n.image[e],m[e]=De(n,m[e]);let h=m[0],g=o.convert(n.format,n.colorSpace),_=o.convert(n.type),x=S(n.internalFormat,g,_,n.normalized,n.colorSpace),C=n.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=w(n,h);le(t.TEXTURE_CUBE_MAP,n);let O;if(f){C&&T&&r.texStorage2D(t.TEXTURE_CUBE_MAP,D,x,h.width,h.height);for(let e=0;e<6;e++){O=m[e].mipmaps;for(let i=0;i<O.length;i++){let a=O[i];n.format===1023?C?E&&r.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+e,i,0,0,a.width,a.height,g,_,a.data):r.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+e,i,x,a.width,a.height,0,g,_,a.data):g===null?Fe(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):C?E&&r.compressedTexSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+e,i,0,0,a.width,a.height,g,a.data):r.compressedTexImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+e,i,x,a.width,a.height,0,a.data)}}}else{if(O=n.mipmaps,C&&T){O.length>0&&D++;let e=Oe(m[0]);r.texStorage2D(t.TEXTURE_CUBE_MAP,D,x,e.width,e.height)}for(let e=0;e<6;e++)if(p){C?E&&r.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,m[e].width,m[e].height,g,_,m[e].data):r.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,x,m[e].width,m[e].height,0,g,_,m[e].data);for(let n=0;n<O.length;n++){let i=O[n].image[e].image;C?E&&r.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+e,n+1,0,0,i.width,i.height,g,_,i.data):r.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+e,n+1,x,i.width,i.height,0,g,_,i.data)}}else{C?E&&r.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,g,_,m[e]):r.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,x,g,_,m[e]);for(let n=0;n<O.length;n++){let i=O[n];C?E&&r.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+e,n+1,0,0,g,_,i.image[e]):r.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+e,n+1,x,g,_,i.image[e])}}}y(n)&&b(t.TEXTURE_CUBE_MAP),u.__version=l.version,n.onUpdate&&n.onUpdate(n)}e.__version=n.version}function he(e,n,a,s,l,u){let d=o.convert(a.format,a.colorSpace),f=o.convert(a.type),p=S(a.internalFormat,d,f,a.normalized,a.colorSpace),m=i.get(n),h=i.get(a);if(h.__renderTarget=n,!m.__hasExternalTextures){let e=Math.max(1,n.width>>u),i=Math.max(1,n.height>>u);l===t.TEXTURE_3D||l===t.TEXTURE_2D_ARRAY?r.texImage3D(l,u,p,e,i,n.depth,0,d,f,null):r.texImage2D(l,u,p,e,i,0,d,f,null)}r.bindFramebuffer(t.FRAMEBUFFER,e),Te(n)?c.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,s,l,h.__webglTexture,0,we(n)):(l===t.TEXTURE_2D||l>=t.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=t.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&t.framebufferTexture2D(t.FRAMEBUFFER,s,l,h.__webglTexture,u),r.bindFramebuffer(t.FRAMEBUFFER,null)}function ge(e,n,r){if(t.bindRenderbuffer(t.RENDERBUFFER,e),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=C(n.stencilBuffer,a),s=n.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;Te(n)?c.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,we(n),o,n.width,n.height):r?t.renderbufferStorageMultisample(t.RENDERBUFFER,we(n),o,n.width,n.height):t.renderbufferStorage(t.RENDERBUFFER,o,n.width,n.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,s,t.RENDERBUFFER,e)}else{let e=n.textures;for(let i=0;i<e.length;i++){let a=e[i],s=o.convert(a.format,a.colorSpace),l=o.convert(a.type),u=S(a.internalFormat,s,l,a.normalized,a.colorSpace);Te(n)?c.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,we(n),u,n.width,n.height):r?t.renderbufferStorageMultisample(t.RENDERBUFFER,we(n),u,n.width,n.height):t.renderbufferStorage(t.RENDERBUFFER,u,n.width,n.height)}}t.bindRenderbuffer(t.RENDERBUFFER,null)}function _e(e,n,a){let s=n.isWebGLCubeRenderTarget===!0;if(r.bindFramebuffer(t.FRAMEBUFFER,e),!(n.depthTexture&&n.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let l=i.get(n.depthTexture);if(l.__renderTarget=n,(!l.__webglTexture||n.depthTexture.image.width!==n.width||n.depthTexture.image.height!==n.height)&&(n.depthTexture.image.width=n.width,n.depthTexture.image.height=n.height,n.depthTexture.needsUpdate=!0),s){if(l.__webglInit===void 0&&(l.__webglInit=!0,n.depthTexture.addEventListener(`dispose`,T)),l.__webglTexture===void 0){l.__webglTexture=t.createTexture(),r.bindTexture(t.TEXTURE_CUBE_MAP,l.__webglTexture),le(t.TEXTURE_CUBE_MAP,n.depthTexture);let e=o.convert(n.depthTexture.format),i=o.convert(n.depthTexture.type),a;n.depthTexture.format===1026?a=t.DEPTH_COMPONENT24:n.depthTexture.format===1027&&(a=t.DEPTH24_STENCIL8);for(let r=0;r<6;r++)t.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+r,0,a,n.width,n.height,0,e,i,null)}}else re(n.depthTexture,0);let u=l.__webglTexture,d=we(n),f=s?t.TEXTURE_CUBE_MAP_POSITIVE_X+a:t.TEXTURE_2D,p=n.depthTexture.format===1027?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;if(n.depthTexture.format===1026)Te(n)?c.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,p,f,u,0,d):t.framebufferTexture2D(t.FRAMEBUFFER,p,f,u,0);else if(n.depthTexture.format===1027)Te(n)?c.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,p,f,u,0,d):t.framebufferTexture2D(t.FRAMEBUFFER,p,f,u,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function I(e){let n=i.get(e),a=e.isWebGLCubeRenderTarget===!0;if(n.__boundDepthTexture!==e.depthTexture){let t=e.depthTexture;if(n.__depthDisposeCallback&&n.__depthDisposeCallback(),t){let e=()=>{delete n.__boundDepthTexture,delete n.__depthDisposeCallback,t.removeEventListener(`dispose`,e)};t.addEventListener(`dispose`,e),n.__depthDisposeCallback=e}n.__boundDepthTexture=t}if(e.depthTexture&&!n.__autoAllocateDepthBuffer){if(a)for(let t=0;t<6;t++)_e(n.__webglFramebuffer[t],e,t);else{let t=e.texture.mipmaps;t&&t.length>0?_e(n.__webglFramebuffer[0],e,0):_e(n.__webglFramebuffer,e,0)}}else if(a){n.__webglDepthbuffer=[];for(let i=0;i<6;i++)if(r.bindFramebuffer(t.FRAMEBUFFER,n.__webglFramebuffer[i]),n.__webglDepthbuffer[i]===void 0)n.__webglDepthbuffer[i]=t.createRenderbuffer(),ge(n.__webglDepthbuffer[i],e,!1);else{let r=e.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,a=n.__webglDepthbuffer[i];t.bindRenderbuffer(t.RENDERBUFFER,a),t.framebufferRenderbuffer(t.FRAMEBUFFER,r,t.RENDERBUFFER,a)}}else{let i=e.texture.mipmaps;if(i&&i.length>0?r.bindFramebuffer(t.FRAMEBUFFER,n.__webglFramebuffer[0]):r.bindFramebuffer(t.FRAMEBUFFER,n.__webglFramebuffer),n.__webglDepthbuffer===void 0)n.__webglDepthbuffer=t.createRenderbuffer(),ge(n.__webglDepthbuffer,e,!1);else{let r=e.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,i=n.__webglDepthbuffer;t.bindRenderbuffer(t.RENDERBUFFER,i),t.framebufferRenderbuffer(t.FRAMEBUFFER,r,t.RENDERBUFFER,i)}}r.bindFramebuffer(t.FRAMEBUFFER,null)}function L(e,n,r){let a=i.get(e);n!==void 0&&he(a.__webglFramebuffer,e,e.texture,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,0),r!==void 0&&I(e)}function ve(e){let n=e.texture,a=i.get(e),c=i.get(n);e.addEventListener(`dispose`,E);let l=e.textures,u=e.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=t.createTexture()),c.__version=n.version,s.memory.textures++),u){a.__webglFramebuffer=[];for(let e=0;e<6;e++)if(n.mipmaps&&n.mipmaps.length>0){a.__webglFramebuffer[e]=[];for(let r=0;r<n.mipmaps.length;r++)a.__webglFramebuffer[e][r]=t.createFramebuffer()}else a.__webglFramebuffer[e]=t.createFramebuffer()}else{if(n.mipmaps&&n.mipmaps.length>0){a.__webglFramebuffer=[];for(let e=0;e<n.mipmaps.length;e++)a.__webglFramebuffer[e]=t.createFramebuffer()}else a.__webglFramebuffer=t.createFramebuffer();if(d)for(let e=0,n=l.length;e<n;e++){let n=i.get(l[e]);n.__webglTexture===void 0&&(n.__webglTexture=t.createTexture(),s.memory.textures++)}if(e.samples>0&&Te(e)===!1){a.__webglMultisampledFramebuffer=t.createFramebuffer(),a.__webglColorRenderbuffer=[],r.bindFramebuffer(t.FRAMEBUFFER,a.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];a.__webglColorRenderbuffer[n]=t.createRenderbuffer(),t.bindRenderbuffer(t.RENDERBUFFER,a.__webglColorRenderbuffer[n]);let i=o.convert(r.format,r.colorSpace),s=o.convert(r.type),c=S(r.internalFormat,i,s,r.normalized,r.colorSpace,e.isXRRenderTarget===!0),u=we(e);t.renderbufferStorageMultisample(t.RENDERBUFFER,u,c,e.width,e.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+n,t.RENDERBUFFER,a.__webglColorRenderbuffer[n])}t.bindRenderbuffer(t.RENDERBUFFER,null),e.depthBuffer&&(a.__webglDepthRenderbuffer=t.createRenderbuffer(),ge(a.__webglDepthRenderbuffer,e,!0)),r.bindFramebuffer(t.FRAMEBUFFER,null)}}if(u){r.bindTexture(t.TEXTURE_CUBE_MAP,c.__webglTexture),le(t.TEXTURE_CUBE_MAP,n);for(let r=0;r<6;r++)if(n.mipmaps&&n.mipmaps.length>0)for(let i=0;i<n.mipmaps.length;i++)he(a.__webglFramebuffer[r][i],e,n,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+r,i);else he(a.__webglFramebuffer[r],e,n,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+r,0);y(n)&&b(t.TEXTURE_CUBE_MAP),r.unbindTexture()}else if(d){for(let n=0,o=l.length;n<o;n++){let o=l[n],s=i.get(o),c=t.TEXTURE_2D;(e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(c=e.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY),r.bindTexture(c,s.__webglTexture),le(c,o),he(a.__webglFramebuffer,e,o,t.COLOR_ATTACHMENT0+n,c,0),y(o)&&b(c)}r.unbindTexture()}else{let i=t.TEXTURE_2D;if((e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(i=e.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY),r.bindTexture(i,c.__webglTexture),le(i,n),n.mipmaps&&n.mipmaps.length>0)for(let r=0;r<n.mipmaps.length;r++)he(a.__webglFramebuffer[r],e,n,t.COLOR_ATTACHMENT0,i,r);else he(a.__webglFramebuffer,e,n,t.COLOR_ATTACHMENT0,i,0);y(n)&&b(i),r.unbindTexture()}e.depthBuffer&&I(e)}function ye(e){let t=e.textures;for(let n=0,a=t.length;n<a;n++){let a=t[n];if(y(a)){let t=x(e),n=i.get(a).__webglTexture;r.bindTexture(t,n),b(t),r.unbindTexture()}}}let xe=[],Se=[];function Ce(e){if(e.samples>0){if(Te(e)===!1){let n=e.textures,a=e.width,o=e.height,s=t.COLOR_BUFFER_BIT,c=e.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,u=i.get(e),d=n.length>1;if(d)for(let e=0;e<n.length;e++)r.bindFramebuffer(t.FRAMEBUFFER,u.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+e,t.RENDERBUFFER,null),r.bindFramebuffer(t.FRAMEBUFFER,u.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+e,t.TEXTURE_2D,null,0);r.bindFramebuffer(t.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=e.texture.mipmaps;f&&f.length>0?r.bindFramebuffer(t.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):r.bindFramebuffer(t.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let r=0;r<n.length;r++){if(e.resolveDepthBuffer&&(e.depthBuffer&&(s|=t.DEPTH_BUFFER_BIT),e.stencilBuffer&&e.resolveStencilBuffer&&(s|=t.STENCIL_BUFFER_BIT)),d){t.framebufferRenderbuffer(t.READ_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.RENDERBUFFER,u.__webglColorRenderbuffer[r]);let e=i.get(n[r]).__webglTexture;t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,e,0)}t.blitFramebuffer(0,0,a,o,0,0,a,o,s,t.NEAREST),l===!0&&(xe.length=0,Se.length=0,xe.push(t.COLOR_ATTACHMENT0+r),e.depthBuffer&&e.storeMultisampledDepthBuffer===!1&&(xe.push(c),Se.push(c),t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,Se)),t.invalidateFramebuffer(t.READ_FRAMEBUFFER,xe))}if(r.bindFramebuffer(t.READ_FRAMEBUFFER,null),r.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),d)for(let e=0;e<n.length;e++){r.bindFramebuffer(t.FRAMEBUFFER,u.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+e,t.RENDERBUFFER,u.__webglColorRenderbuffer[e]);let a=i.get(n[e]).__webglTexture;r.bindFramebuffer(t.FRAMEBUFFER,u.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+e,t.TEXTURE_2D,a,0)}r.bindFramebuffer(t.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(e.depthBuffer&&e.storeMultisampledDepthBuffer===!1&&l){let n=e.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,[n])}}}function we(e){return Math.min(a.maxSamples,e.samples)}function Te(e){let t=i.get(e);return e.samples>0&&n.has(`WEBGL_multisampled_render_to_texture`)===!0&&t.__useRenderToTexture!==!1}function Ee(e){let t=s.render.frame;f.get(e)!==t&&(f.set(e,t),e.update())}function De(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(Ie.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&Fe(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):$e(`WebGLTextures: Unsupported texture color space:`,n)),t}function Oe(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(u.width=e.naturalWidth||e.width,u.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(u.width=e.displayWidth,u.height=e.displayHeight):(u.width=e.width,u.height=e.height),u}this.allocateTextureUnit=M,this.resetTextureUnits=ee,this.getTextureUnits=te,this.setTextureUnits=j,this.setTexture2D=re,this.setTexture2DArray=ie,this.setTexture3D=ae,this.setTextureCube=oe,this.rebindTextures=L,this.setupRenderTarget=ve,this.updateRenderTargetMipmap=ye,this.updateMultisampleRenderTarget=Ce,this.setupDepthRenderbuffer=I,this.setupFrameBufferTexture=he,this.useMultisampledRTT=Te,this.isReversedDepthBuffer=function(){return r.buffers.depth.getReversed()}}function Ni(e,t){function n(n,r=``){let i,a=Ie.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Pi=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Fi=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Ii=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new E(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new P({vertexShader:Pi,fragmentShader:Fi,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new U(new se(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Li=class extends Ve{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,u=null,f=null,p=null,m=null,h=null,g=typeof XRWebGLBinding<`u`,_=new Ii,y={},b=t.getContextAttributes(),x=null,S=null,w=[],T=[],D=new F,k=null,A=null,ee=new Ce;ee.viewport=new re;let te=new Ce;te.viewport=new re;let M=[ee,te],N=new V,ne=null,ie=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=w[e];return t===void 0&&(t=new Xe,w[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=w[e];return t===void 0&&(t=new Xe,w[e]=t),t.getGripSpace()},this.getHand=function(e){let t=w[e];return t===void 0&&(t=new Xe,w[e]=t),t.getHandSpace()};function ae(e){let t=T.indexOf(e.inputSource);if(t===-1)return;let n=w[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function oe(){r.removeEventListener(`select`,ae),r.removeEventListener(`selectstart`,ae),r.removeEventListener(`selectend`,ae),r.removeEventListener(`squeeze`,ae),r.removeEventListener(`squeezestart`,ae),r.removeEventListener(`squeezeend`,ae),r.removeEventListener(`end`,oe),r.removeEventListener(`inputsourceschange`,se);for(let e=0;e<w.length;e++){let t=T[e];t!==null&&(T[e]=null,w[e].disconnect(t))}ne=null,ie=null,_.reset();for(let e in y)delete y[e];if(e.setRenderTarget(x),m=null,p=null,f=null,r=null,S=null,ge.stop(),n.isPresenting=!1,e.setPixelRatio(k),e.setSize(D.width,D.height,!1),A!==null){let e=A.camera;e.fov=A.fov,e.zoom=A.zoom,e.updateProjectionMatrix(),A=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&Fe(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&Fe(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return p===null?m:p},this.getBinding=function(){return f===null&&g&&(f=new XRWebGLBinding(r,t)),f},this.getFrame=function(){return h},this.getSession=function(){return r},this.setSession=async function(u){if(r=u,r!==null){if(x=e.getRenderTarget(),r.addEventListener(`select`,ae),r.addEventListener(`selectstart`,ae),r.addEventListener(`selectend`,ae),r.addEventListener(`squeeze`,ae),r.addEventListener(`squeezestart`,ae),r.addEventListener(`squeezeend`,ae),r.addEventListener(`end`,oe),r.addEventListener(`inputsourceschange`,se),b.xrCompatible!==!0&&await t.makeXRCompatible(),k=e.getPixelRatio(),e.getSize(D),g&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;b.depth&&(o=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=b.stencil?d:ce,a=b.stencil?me:C);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};f=this.getBinding(),p=f.createProjectionLayer(s),r.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),S=new je(p.textureWidth,p.textureHeight,{format:O,type:v,depthTexture:new l(p.textureWidth,p.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}else{let n={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:i};m=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),S=new je(m.framebufferWidth,m.framebufferHeight,{format:O,type:v,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1,storeMultisampledDepthBuffer:m.ignoreDepthValues===!1,storeMultisampledStencilBuffer:m.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),ge.setContext(r),ge.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function se(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=T.indexOf(n);r>=0&&(T[r]=null,w[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=T.indexOf(n);if(r===-1){for(let e=0;e<w.length;e++)if(e>=T.length){T.push(n),r=e;break}else if(T[e]===null){T[e]=n,r=e;break}if(r===-1)break}let i=w[r];i&&i.connect(n)}}let P=new I,le=new I;function ue(e,t,n){P.setFromMatrixPosition(t.matrixWorld),le.setFromMatrixPosition(n.matrixWorld);let r=P.distanceTo(le),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function de(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;_.texture!==null&&(_.depthNear>0&&(t=_.depthNear),_.depthFar>0&&(n=_.depthFar)),N.near=te.near=ee.near=t,N.far=te.far=ee.far=n,(ne!==N.near||ie!==N.far)&&(r.updateRenderState({depthNear:N.near,depthFar:N.far}),ne=N.near,ie=N.far),N.layers.mask=e.layers.mask|6,ee.layers.mask=N.layers.mask&-5,te.layers.mask=N.layers.mask&-3;let i=e.parent,a=N.cameras;de(N,i);for(let e=0;e<a.length;e++)de(a[e],i);a.length===2?ue(N,ee,te):N.projectionMatrix.copy(ee.projectionMatrix),A===null&&e.isPerspectiveCamera&&(A={camera:e,fov:e.fov,zoom:e.zoom}),fe(e,N,i)};function fe(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=j*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return N},this.getFoveation=function(){if(p!==null||m!==null)return s},this.setFoveation=function(e){s=e,p!==null&&(p.fixedFoveation=e),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=e)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(N)},this.getCameraTexture=function(e){return y[e]};let pe=null;function he(t,i){if(u=i.getViewerPose(c||a),h=i,u!==null){let t=u.views;m!==null&&(e.setRenderTargetFramebuffer(S,m.framebuffer),e.setRenderTarget(S));let i=!1;t.length!==N.cameras.length&&(N.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(m!==null)a=m.getViewport(r);else{let t=f.getViewSubImage(p,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(S,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(S))}let o=M[n];o===void 0&&(o=new Ce,o.layers.enable(n),o.viewport=new re,M[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(N.matrix.copy(o.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale)),i===!0&&N.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&g){f=n.getBinding();let e=f.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&_.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&g){e.state.unbindTexture(),f=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=y[n];e||(e=new E,y[n]=e);let t=f.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<w.length;e++){let t=T[e],n=w[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}pe&&pe(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),h=null}let ge=new Dt;ge.setAnimationLoop(he),this.setAnimationLoop=function(e){pe=e},this.dispose=function(){}}},Ri=new xe,zi=new H;zi.set(-1,0,0,0,1,0,0,0,1);function Bi(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Te(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Ri.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(zi),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Vi(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(g(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,v));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return $e(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)p(t[n],e,n,a);else p(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(t,n,r,i){if(h(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=_(i);m(i,t.__data,e),typeof i!=`number`&&typeof i!=`boolean`&&!i.isMatrix3&&!ArrayBuffer.isView(i)&&(e+=a.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function m(e,t,n){typeof e==`number`||typeof e==`boolean`?t[0]=e:e.isMatrix3?(t[0]=e.elements[0],t[1]=e.elements[1],t[2]=e.elements[2],t[3]=0,t[4]=e.elements[3],t[5]=e.elements[4],t[6]=e.elements[5],t[7]=0,t[8]=e.elements[6],t[9]=e.elements[7],t[10]=e.elements[8],t[11]=0):ArrayBuffer.isView(e)?t.set(new e.constructor(e.buffer,e.byteOffset,t.length)):e.toArray(t,n)}function h(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:ArrayBuffer.isView(i)?i.slice():i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(ArrayBuffer.isView(i))return!0;else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function g(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=_(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function _(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?Fe(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(t.boundary=16,t.storage=e.byteLength):Fe(`WebGLRenderer: Unsupported uniform value type.`,e),t}function v(t){let n=t.target;n.removeEventListener(`dispose`,v);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function y(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:y}}var Hi=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Ui=null;function Wi(){return Ui===null&&(Ui=new _t(Hi,16,16,We,i),Ui.name=`DFG_LUT`,Ui.minFilter=ne,Ui.magFilter=ne,Ui.wrapS=qe,Ui.wrapT=qe,Ui.generateMipmaps=!1,Ui.needsUpdate=!0),Ui}var Gi=class{constructor(n={}){let{canvas:r=Be(),context:a=null,depth:o=!0,stencil:s=!1,alpha:c=!1,antialias:l=!1,premultipliedAlpha:u=!0,preserveDrawingBuffer:d=!1,powerPreference:f=`default`,failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:m=!1,outputBufferType:h=v}=n;this.isWebGLRenderer=!0;let g;if(a!==null){if(typeof WebGLRenderingContext<`u`&&a instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);g=a.getContextAttributes().alpha}else g=c;let _=h,y=new Set([ee,pt,Je]),b=new Set([v,C,_e,me,it,S]),x=new Uint32Array(4),T=new Int32Array(4),E=new I,D=null,O=null,k=[],A=[],te=null;this.domElement=r,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let j=this,M=!1,N=null,ne=null,ie=null,ae=null;this._outputColorSpace=oe;let se=0,ce=0,P=null,le=-1,ue=null,de=new re,fe=new re,pe=null,he=new B(0),F=0,ge=r.width,L=r.height,ve=1,ye=null,be=null,Se=new re(0,0,ge,L),Ce=new re(0,0,ge,L),we=!1,Te=new w,Ee=!1,De=!1,Oe=new xe,Ae=new I,Me=new re,Ne={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Pe=!1;function R(){return P===null?ve:1}let z=a;function Le(e,t){return r.getContext(e,t)}let Re,ze,V,H,Ve,He,Ue,We,Ke,qe,Ye,Xe,Ze,Qe,U,et,tt,nt,rt,at,ot,st,ct;try{let e={alpha:!0,depth:o,stencil:s,antialias:l,premultipliedAlpha:u,preserveDrawingBuffer:d,powerPreference:f,failIfMajorPerformanceCaveat:p};if(`setAttribute`in r&&r.setAttribute(`data-engine`,`three.js r186`),r.addEventListener(`webglcontextlost`,dt,!1),r.addEventListener(`webglcontextrestored`,ft,!1),r.addEventListener(`webglcontextcreationerror`,mt,!1),z===null){let t=`webgl2`;if(z=Le(t,e),z===null)throw Le(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}lt()}catch(e){throw r.removeEventListener(`webglcontextlost`,dt,!1),r.removeEventListener(`webglcontextrestored`,ft,!1),r.removeEventListener(`webglcontextcreationerror`,mt,!1),$e(`WebGLRenderer: `+e.message),e}function lt(){Re=new ln(z),Re.init(),ot=new Ni(z,Re),ze=new Lt(z,Re,n,ot),V=new ji(z,Re),ze.reversedDepthBuffer&&m&&V.buffers.depth.setReversed(!0),ne=z.createFramebuffer(),ie=z.createFramebuffer(),ae=z.createFramebuffer(),H=new fn(z),Ve=new di,He=new Mi(z,Re,V,Ve,ze,ot,H),Ue=new cn(j),We=new Ot(z),st=new Ft(z,We),Ke=new un(z,We,H,st),qe=new mn(z,Ke,We,st,H),nt=new pn(z,ze,He),U=new Rt(Ve),Ye=new ui(j,Ue,Re,ze,st,U),Xe=new Bi(j,Ve),Ze=new hi,Qe=new Si(Re),tt=new Pt(j,Ue,V,qe,g,u),et=new Ai(j,qe,ze),ct=new Vi(z,H,ze,V),rt=new It(z,Re,H),at=new dn(z,Re,H),H.programs=Ye.programs,j.capabilities=ze,j.extensions=Re,j.properties=Ve,j.renderLists=Ze,j.shadowMap=et,j.state=V,j.info=H}_!==1009&&(te=new gn(_,r.width,r.height,l,o,s));let ut=new Li(j,z);this.xr=ut,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){let e=Re.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Re.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return ve},this.setPixelRatio=function(e){e!==void 0&&(ve=e,this.setSize(ge,L,!1))},this.getSize=function(e){return e.set(ge,L)},this.setSize=function(e,t,n=!0){if(ut.isPresenting){Fe(`WebGLRenderer: Can't change size while VR device is presenting.`);return}ge=e,L=t,r.width=Math.floor(e*ve),r.height=Math.floor(t*ve),n===!0&&(r.style.width=e+`px`,r.style.height=t+`px`),te!==null&&te.setSize(r.width,r.height),this.setViewport(0,0,e,t)},this.getDrawingBufferSize=function(e){return e.set(ge*ve,L*ve).floor()},this.setDrawingBufferSize=function(e,t,n){ge=e,L=t,ve=n,r.width=Math.floor(e*n),r.height=Math.floor(t*n),this.setViewport(0,0,e,t)},this.setEffects=function(e){if(_===1009){$e(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);return}if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){Fe(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}te.setEffects(e||[])},this.getCurrentViewport=function(e){return e.copy(de)},this.getViewport=function(e){return e.copy(Se)},this.setViewport=function(e,t,n,r){e.isVector4?Se.set(e.x,e.y,e.z,e.w):Se.set(e,t,n,r),V.viewport(de.copy(Se).multiplyScalar(ve).round())},this.getScissor=function(e){return e.copy(Ce)},this.setScissor=function(e,t,n,r){e.isVector4?Ce.set(e.x,e.y,e.z,e.w):Ce.set(e,t,n,r),V.scissor(fe.copy(Ce).multiplyScalar(ve).round())},this.getScissorTest=function(){return we},this.setScissorTest=function(e){V.setScissorTest(we=e)},this.setOpaqueSort=function(e){ye=e},this.setTransparentSort=function(e){be=e},this.getClearColor=function(e){return e.copy(tt.getClearColor())},this.setClearColor=function(){tt.setClearColor(...arguments)},this.getClearAlpha=function(){return tt.getClearAlpha()},this.setClearAlpha=function(){tt.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(P!==null){let t=P.texture.format;e=y.has(t)}if(e){let e=P.texture.type,t=b.has(e),n=tt.getClearColor(),r=tt.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(x[0]=i,x[1]=a,x[2]=o,x[3]=r,z.clearBufferuiv(z.COLOR,0,x)):(T[0]=i,T[1]=a,T[2]=o,T[3]=r,z.clearBufferiv(z.COLOR,0,T))}else r|=z.COLOR_BUFFER_BIT}t&&(r|=z.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&z.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),N=e},this.dispose=function(){r.removeEventListener(`webglcontextlost`,dt,!1),r.removeEventListener(`webglcontextrestored`,ft,!1),r.removeEventListener(`webglcontextcreationerror`,mt,!1),tt.dispose(),Ze.dispose(),Qe.dispose(),Ve.dispose(),Ue.dispose(),qe.dispose(),st.dispose(),ct.dispose(),Ye.dispose(),ut.dispose(),ut.removeEventListener(`sessionstart`,xt),ut.removeEventListener(`sessionend`,St),Ct.stop()};function dt(e){e.preventDefault(),Ge(`WebGLRenderer: Context Lost.`),M=!0}function ft(){Ge(`WebGLRenderer: Context Restored.`),M=!1;let e=H.autoReset,t=et.enabled,n=et.autoUpdate,r=et.needsUpdate,i=et.type;lt(),H.autoReset=e,et.enabled=t,et.autoUpdate=n,et.needsUpdate=r,et.type=i}function mt(e){$e(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function ht(e){let t=e.target;t.removeEventListener(`dispose`,ht),gt(t)}function gt(e){_t(e),Ve.remove(e)}function _t(e){let t=Ve.get(e).programs;t!==void 0&&(t.forEach(function(e){Ye.releaseProgram(e)}),e.isShaderMaterial&&Ye.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=Ne);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=Nt(e,t,n,r,i);V.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Ke.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;st.setup(i,r,s,n,c);let h,g=rt;if(c!==null&&(h=We.get(c),g=at,g.setIndex(h)),i.isMesh)r.wireframe===!0?(V.setLineWidth(r.wireframeLinewidth*R()),g.setMode(z.LINES)):g.setMode(z.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),V.setLineWidth(e*R()),i.isLineSegments?g.setMode(z.LINES):i.isLineLoop?g.setMode(z.LINE_LOOP):g.setMode(z.LINE_STRIP)}else i.isPoints?g.setMode(z.POINTS):i.isSprite&&g.setMode(z.TRIANGLES);if(i.isBatchedMesh){if(Re.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?We.get(c).bytesPerElement:1,o=Ve.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(z,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function vt(e,t,n,r){N!==null&&e.isNodeMaterial&&N.setObject(r,e),Ee===!0&&U.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,G(e,t,r),e.side=0,e.needsUpdate=!0,G(e,t,r),e.side=2):G(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),N!==null&&N.renderStart(e,t,n),O=Qe.get(n),O.init(t),A.push(O),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(O.pushLight(e),e.castShadow&&O.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(O.pushLight(e),e.castShadow&&O.pushShadow(e))}),O.setupLights(),N!==null&&N.updateLights(O.state.lightsArray),De=this.localClippingEnabled,Ee=U.init(this.clippingPlanes,De),Ee===!0&&U.setGlobalState(this.clippingPlanes,t),N!==null&&et.render(O.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];vt(o,n,t,e),r.add(o)}else vt(i,n,t,e),r.add(i)}}),O=A.pop(),N!==null&&N.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){let t=Ve.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}Re.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let yt=null;function bt(e){yt&&yt(e)}function xt(){Ct.stop()}function St(){Ct.start()}let Ct=new Dt;Ct.setAnimationLoop(bt),typeof self<`u`&&Ct.setContext(self),this.setAnimationLoop=function(e){yt=e,ut.setAnimationLoop(e),e===null?Ct.stop():Ct.start()},ut.addEventListener(`sessionstart`,xt),ut.addEventListener(`sessionend`,St),this.render=function(e,n){if(n!==void 0&&n.isCamera!==!0){$e(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(M===!0)return;N!==null&&N.renderStart(e,n);let r=ut.enabled===!0&&ut.isPresenting===!0,i=te!==null&&(P===null||r)&&te.begin(j,P);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),n.parent===null&&n.matrixWorldAutoUpdate===!0&&n.updateMatrixWorld(),ut.enabled===!0&&ut.isPresenting===!0&&(te===null||te.isCompositing()===!1)&&(ut.cameraAutoUpdate===!0&&ut.updateCamera(n),n=ut.getCamera()),e.isScene===!0&&e.onBeforeRender(j,e,n,P),O=Qe.get(e,A.length),O.init(n),O.state.textureUnits=He.getTextureUnits(),A.push(O),Oe.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),Te.setFromProjectionMatrix(Oe,t,n.reversedDepth),De=this.localClippingEnabled,Ee=U.init(this.clippingPlanes,De),D=Ze.get(e,k.length),D.init(),k.push(D),ut.enabled===!0&&ut.isPresenting===!0){let e=j.xr.getDepthSensingMesh();e!==null&&W(e,n,-1/0,j.sortObjects)}W(e,n,0,j.sortObjects),D.finish(),N!==null&&N.updateLights(O.state.lightsArray),j.sortObjects===!0&&D.sort(ye,be),Pe=ut.enabled===!1||ut.isPresenting===!1||ut.hasDepthSensing()===!1,Pe&&tt.addToRenderList(D,e),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Ee===!0&&U.beginShadows();let a=O.state.shadowsArray;if(et.render(a,e,n),Ee===!0&&U.endShadows(),(i&&te.hasRenderPass())===!1){let t=D.opaque,r=D.transmissive;if(O.setupLights(),n.isArrayCamera){let i=n.cameras;if(r.length>0)for(let n=0,a=i.length;n<a;n++){let a=i[n];Tt(t,r,e,a)}Pe&&tt.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];wt(D,e,n,n.viewport)}}else r.length>0&&Tt(t,r,e,n),Pe&&tt.render(e),wt(D,e,n)}P!==null&&ce===0&&(He.updateMultisampleRenderTarget(P),He.updateRenderTargetMipmap(P)),i&&te.end(j),e.isScene===!0&&e.onAfterRender(j,e,n),st.resetDefaultState(),le=-1,ue=null,A.pop(),A.length>0?(O=A[A.length-1],He.setTextureUnits(O.state.textureUnits),Ee===!0&&U.setGlobalState(j.clippingPlanes,O.state.camera)):O=null,k.pop(),D=k.length>0?k[k.length-1]:null,N!==null&&N.renderEnd()};function W(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLightProbeGrid)O.pushLightProbeGrid(e);else if(e.isLight)O.pushLight(e),e.castShadow&&O.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||e.intersectsFrustum(Te)){r&&Me.setFromMatrixPosition(e.matrixWorld).applyMatrix4(Oe);let i=qe.update(e),a=e.material;a.visible&&D.push(e,i,a,n,Me.z,null,t)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||e.intersectsFrustum(Te))){let i=qe.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),Me.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),Me.copy(e.boundingSphere.center)),Me.applyMatrix4(e.matrixWorld).applyMatrix4(Oe)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&D.push(e,i,c,n,Me.z,s,t)}}else a.visible&&D.push(e,i,a,n,Me.z,null,t)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)W(i[e],t,n,r)}function wt(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;O.setupLightsView(n),Ee===!0&&U.setGlobalState(j.clippingPlanes,n),r&&V.viewport(de.copy(r)),i.length>0&&Et(i,t,n),a.length>0&&Et(a,t,n),o.length>0&&Et(o,t,n),V.buffers.depth.setTest(!0),V.buffers.depth.setMask(!0),V.buffers.color.setMask(!0),V.setPolygonOffset(!1)}function Tt(t,n,r,a){if((r.isScene===!0?r.overrideMaterial:null)!==null)return;if(O.state.transmissionRenderTarget[a.id]===void 0){let t=Re.has(`EXT_color_buffer_half_float`)||Re.has(`EXT_color_buffer_float`);O.state.transmissionRenderTarget[a.id]=new je(1,1,{generateMipmaps:!0,type:t?i:v,minFilter:e,samples:Math.max(4,ze.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Ie.workingColorSpace})}let o=O.state.transmissionRenderTarget[a.id],c=a.viewport||de;o.setSize(c.z*j.transmissionResolutionScale,c.w*j.transmissionResolutionScale);let l=j.getRenderTarget(),u=j.getActiveCubeFace(),d=j.getActiveMipmapLevel();j.setRenderTarget(o),j.getClearColor(he),F=j.getClearAlpha(),F<1&&j.setClearColor(16777215,.5),j.clear(),Pe&&tt.render(r);let f=j.toneMapping;j.toneMapping=0;let p=a.viewport;if(a.viewport!==void 0&&(a.viewport=void 0),O.setupLightsView(a),Ee===!0&&U.setGlobalState(j.clippingPlanes,a),Et(t,r,a),He.updateMultisampleRenderTarget(o),He.updateRenderTargetMipmap(o),Re.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let t=0,i=n.length;t<i;t++){let{object:i,geometry:o,material:s,group:c}=n[t];if(s.side===2&&i.layers.test(a.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,kt(i,r,a,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(He.updateMultisampleRenderTarget(o),He.updateRenderTargetMipmap(o))}j.setRenderTarget(l,u,d),j.setClearColor(he,F),p!==void 0&&(a.viewport=p),j.toneMapping=f}function Et(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&kt(o,t,n,s,l,c)}}function kt(e,t,n,r,i,a){N!==null&&i.isNodeMaterial&&N.setObject(e,i),e.onBeforeRender(j,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(j,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,j.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,j.renderBufferDirect(n,t,r,i,e,a),i.side=2):j.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(j,t,n,r,i,a)}function G(e,t,n){t.isScene!==!0&&(t=Ne);let r=Ve.get(e),i=O.state.lights,a=O.state.shadowsArray,o=i.state.version,s=Ye.getParameters(e,i.state,a,t,n,O.state.lightProbeGridArray),c=Ye.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Ue.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,ht),l=new Map,r.programs=l);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return jt(e,s),d}else s.uniforms=Ye.getUniforms(e),N!==null&&e.isNodeMaterial&&N.build(e,n,s),e.onBeforeCompile(s,j),d=Ye.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=U.uniform),jt(e,s),r.needsLights=Bt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.lightProbeGrid=O.state.lightProbeGridArray.length>0,r.currentProgram=d,r.uniformsList=null,d}function At(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Cr.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function jt(e,t){let n=Ve.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function Mt(e,t){if(e.length===0)return null;if(e.length===1)return e[0].texture===null?null:e[0];E.setFromMatrixPosition(t.matrixWorld);for(let t=0,n=e.length;t<n;t++){let n=e[t];if(n.texture!==null&&n.boundingBox.containsPoint(E))return n}return null}function Nt(e,t,n,r,i){t.isScene!==!0&&(t=Ne),He.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=P===null?j.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:Ie.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Ue.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(h=j.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=Ve.get(r),y=O.state.lights;if(Ee===!0&&(De===!0||e!==ue)){let t=e===ue&&r.id===le;U.setState(r,e,t)}let b=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?b=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==U.numPlanes||v.numIntersection!==U.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.toneMapping===h&&v.morphTargetsCount===_?!!v.lightProbeGrid!=O.state.lightProbeGridArray.length>0&&(b=!0):b=!0:b=!0:b=!0:(b=!0,v.__version=r.version);let x=v.currentProgram;b===!0&&(x=G(r,t,i),N&&r.isNodeMaterial&&N.onUpdateProgram(r,x,v));let S=!1,C=!1,w=!1,T=x.getUniforms(),E=v.uniforms;if(V.useProgram(x.program)&&(S=!0,C=!0,w=!0),r.id!==le&&(le=r.id,C=!0),v.needsLights){let e=Mt(O.state.lightProbeGridArray,i);v.lightProbeGrid!==e&&(v.lightProbeGrid=e,C=!0)}if(S||ue!==e){V.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),T.setValue(z,`projectionMatrix`,e.projectionMatrix),T.setValue(z,`viewMatrix`,e.matrixWorldInverse);let t=T.map.cameraPosition;t!==void 0&&t.setValue(z,Ae.setFromMatrixPosition(e.matrixWorld)),ze.logarithmicDepthBuffer&&T.setValue(z,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&T.setValue(z,`isOrthographic`,e.isOrthographicCamera===!0),ue!==e&&(ue=e,C=!0,w=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&T.setValue(z,`sunShadowMap`,y.state.sunShadowMap,He),y.state.directionalShadowMap.length>0&&T.setValue(z,`directionalShadowMap`,y.state.directionalShadowMap,He),y.state.spotShadowMap.length>0&&T.setValue(z,`spotShadowMap`,y.state.spotShadowMap,He),y.state.pointShadowMap.length>0&&T.setValue(z,`pointShadowMap`,y.state.pointShadowMap,He)),i.isSkinnedMesh){T.setOptional(z,i,`bindMatrix`),T.setOptional(z,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),T.setValue(z,`boneTexture`,e.boneTexture,He))}i.isBatchedMesh&&(T.setOptional(z,i,`batchingTexture`),T.setValue(z,`batchingTexture`,i._matricesTexture,He),T.setOptional(z,i,`batchingIdTexture`),T.setValue(z,`batchingIdTexture`,i._indirectTexture,He),T.setOptional(z,i,`batchingColorTexture`),i._colorsTexture!==null&&T.setValue(z,`batchingColorTexture`,i._colorsTexture,He));let D=n.morphAttributes;if((D.position!==void 0||D.normal!==void 0||D.color!==void 0)&&nt.update(i,n,x),(C||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,T.setValue(z,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(E.envMapIntensity.value=t.environmentIntensity),E.dfgLUT!==void 0&&(E.dfgLUT.value=Wi()),C){if(T.setValue(z,`toneMappingExposure`,j.toneMappingExposure),v.needsLights&&zt(E,w),a&&r.fog===!0&&Xe.refreshFogUniforms(E,a),Xe.refreshMaterialUniforms(E,r,ve,L,O.state.transmissionRenderTarget[e.id]),v.needsLights&&v.lightProbeGrid){let e=v.lightProbeGrid;E.probesSH.value=e.texture,E.probesMin.value.copy(e.boundingBox.min),E.probesMax.value.copy(e.boundingBox.max),E.probesResolution.value.copy(e.resolution)}Cr.upload(z,At(v),E,He)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Cr.upload(z,At(v),E,He),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&T.setValue(z,`center`,i.center),T.setValue(z,`modelViewMatrix`,i.modelViewMatrix),T.setValue(z,`normalMatrix`,i.normalMatrix),T.setValue(z,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];ct.update(n,x),ct.bind(n,x)}}return x}function zt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function Bt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return se},this.getActiveMipmapLevel=function(){return ce},this.getRenderTarget=function(){return P},this.setRenderTargetTextures=function(e,t,n){let r=Ve.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),Ve.get(e.texture).__webglTexture=t,Ve.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=Ve.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){P=e,se=t,ce=n;let r=null,i=!1,a=!1;if(e){let o=Ve.get(e);if(o.__useDefaultFramebuffer!==void 0){V.bindFramebuffer(z.FRAMEBUFFER,o.__webglFramebuffer),de.copy(e.viewport),fe.copy(e.scissor),pe=e.scissorTest,V.viewport(de),V.scissor(fe),V.setScissorTest(pe),le=-1;return}if(o.__webglFramebuffer===void 0)He.setupRenderTarget(e);else if(o.__hasExternalTextures)He.rebindTextures(e,Ve.get(e.texture).__webglTexture,Ve.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&Ve.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);He.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=Ve.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&He.useMultisampledRTT(e)===!1?Ve.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,de.copy(e.viewport),fe.copy(e.scissor),pe=e.scissorTest}else de.copy(Se).multiplyScalar(ve).floor(),fe.copy(Ce).multiplyScalar(ve).floor(),pe=we;if(n!==0&&(r=ne),V.bindFramebuffer(z.FRAMEBUFFER,r)&&V.drawBuffers(e,r),V.viewport(de),V.scissor(fe),V.setScissorTest(pe),i){let r=Ve.get(e.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=Ve.get(e.textures[t]);z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=Ve.get(e.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,t.__webglTexture,n)}le=-1};function Vt(e){let t=Ve.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=ze.textureFormatReadable(e.format),t.__typeReadable=ze.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){$e(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=Ve.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){V.bindFramebuffer(z.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+s);let u=Vt(o);if(u.__formatReadable===!1){$e(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){$e(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&z.readPixels(t,n,r,i,ot.convert(c),ot.convert(l),a)}finally{let e=P===null?null:Ve.get(P).__webglFramebuffer;V.bindFramebuffer(z.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=Ve.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){V.bindFramebuffer(z.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+s);let d=Vt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=z.createBuffer();z.bindBuffer(z.PIXEL_PACK_BUFFER,f),z.bufferData(z.PIXEL_PACK_BUFFER,a.byteLength,z.STREAM_READ),z.readPixels(t,n,r,i,ot.convert(l),ot.convert(u),0),z.bindBuffer(z.PIXEL_PACK_BUFFER,null);let p=P===null?null:Ve.get(P).__webglFramebuffer;V.bindFramebuffer(z.FRAMEBUFFER,p);let m=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await ke(z,m,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,f),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,a),z.bindBuffer(z.PIXEL_PACK_BUFFER,null),z.deleteBuffer(f),z.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;He.setTexture2D(e,0),z.copyTexSubImage2D(z.TEXTURE_2D,n,0,0,o,s,i,a),V.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=ot.convert(t.format),_=ot.convert(t.type),v;t.isData3DTexture?(He.setTexture3D(t,0),v=z.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(He.setTexture2DArray(t,0),v=z.TEXTURE_2D_ARRAY):(He.setTexture2D(t,0),v=z.TEXTURE_2D),V.activeTexture(z.TEXTURE0),V.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,t.flipY),V.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),V.pixelStorei(z.UNPACK_ALIGNMENT,t.unpackAlignment);let y=V.getParameter(z.UNPACK_ROW_LENGTH),b=V.getParameter(z.UNPACK_IMAGE_HEIGHT),x=V.getParameter(z.UNPACK_SKIP_PIXELS),S=V.getParameter(z.UNPACK_SKIP_ROWS),C=V.getParameter(z.UNPACK_SKIP_IMAGES);V.pixelStorei(z.UNPACK_ROW_LENGTH,h.width),V.pixelStorei(z.UNPACK_IMAGE_HEIGHT,h.height),V.pixelStorei(z.UNPACK_SKIP_PIXELS,l),V.pixelStorei(z.UNPACK_SKIP_ROWS,u),V.pixelStorei(z.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=Ve.get(e),r=Ve.get(t),h=Ve.get(n.__renderTarget),g=Ve.get(r.__renderTarget);V.bindFramebuffer(z.READ_FRAMEBUFFER,h.__webglFramebuffer),V.bindFramebuffer(z.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Ve.get(e).__webglTexture,i,d+n),z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Ve.get(t).__webglTexture,a,m+n)),z.blitFramebuffer(l,u,o,s,f,p,o,s,z.DEPTH_BUFFER_BIT,z.NEAREST);V.bindFramebuffer(z.READ_FRAMEBUFFER,null),V.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||Ve.has(e)){let n=Ve.get(e),r=Ve.get(t);V.bindFramebuffer(z.READ_FRAMEBUFFER,ie),V.bindFramebuffer(z.DRAW_FRAMEBUFFER,ae);for(let e=0;e<c;e++)w?z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):z.framebufferTexture2D(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,n.__webglTexture,i),T?z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):z.framebufferTexture2D(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,r.__webglTexture,a),i===0?T?z.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):z.copyTexSubImage2D(v,a,f,p,l,u,o,s):z.blitFramebuffer(l,u,o,s,f,p,o,s,z.COLOR_BUFFER_BIT,z.NEAREST);V.bindFramebuffer(z.READ_FRAMEBUFFER,null),V.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?z.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?z.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):z.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):z.texSubImage2D(z.TEXTURE_2D,a,f,p,o,s,g,_,h);V.pixelStorei(z.UNPACK_ROW_LENGTH,y),V.pixelStorei(z.UNPACK_IMAGE_HEIGHT,b),V.pixelStorei(z.UNPACK_SKIP_PIXELS,x),V.pixelStorei(z.UNPACK_SKIP_ROWS,S),V.pixelStorei(z.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&z.generateMipmap(v),V.unbindTexture()},this.initRenderTarget=function(e){Ve.get(e).__webglFramebuffer===void 0&&He.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?He.setTextureCube(e,0):e.isData3DTexture?He.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?He.setTexture2DArray(e,0):He.setTexture2D(e,0),V.unbindTexture()},this.resetState=function(){se=0,ce=0,P=null,V.reset(),st.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return t}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Ie._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ie._getUnpackColorSpace()}},Ki={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},qi=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},Ji=new gt(-1,1,1,-1,0,1),Yi=new class extends we{constructor(){super(),this.setAttribute(`position`,new M([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new M([0,2,0,0,2,0],2))}},Xi=class{constructor(e){this._mesh=new U(Yi,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Ji)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},Zi=class extends qi{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof P?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=fe.clone(e.uniforms),this.material=new P({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new Xi(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},Qi=class extends qi{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},$i=class extends qi{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},ea=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new F);this._width=n.width,this._height=n.height,t=new je(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:i}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Zi(Ki),this.copyPass.material.blending=0,this.timer=new h}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}Qi!==void 0&&(r instanceof Qi?n=!0:r instanceof $i&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new F);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},ta={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new B(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},na=class e extends qi{constructor(e,t=1,n,r){super(),this.strength=t,this.radius=n,this.threshold=r,this.resolution=e===void 0?new F(256,256):new F(e.x,e.y),this.clearColor=new B(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new je(a,o,{type:i,depthBuffer:!1}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new je(a,o,{type:i,depthBuffer:!1});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new je(a,o,{type:i,depthBuffer:!1});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),a=Math.round(a/2),o=Math.round(o/2)}let s=ta;this.highPassUniforms=fe.clone(s.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new P({uniforms:this.highPassUniforms,vertexShader:s.vertexShader,fragmentShader:s.fragmentShader}),this.separableBlurMaterials=[];let c=[6,10,14,18,22];a=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(c[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new F(1/a,1/o),a=Math.round(a/2),o=Math.round(o/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let l=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=l,this.bloomTintColors=[new I(1,1,1),new I(1,1,1),new I(1,1,1),new I(1,1,1),new I(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=fe.clone(Ki.uniforms),this.blendMaterial=new P({uniforms:this.copyUniforms,vertexShader:Ki.vertexShader,fragmentShader:Ki.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new B,this._oldClearAlpha=1,this._basic=new lt,this._fsQuad=new Xi(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new F(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(t,n,r,i,a){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[n]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[n]),t.clear(),this._fsQuad.render(t),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(r),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);let r=[],i=[];for(let n=1;n<e;n+=2){let a=t[n],o=n+1<e?t[n+1]:0,s=a+o;r.push((n*a+(n+1)*o)/s),i.push(s)}return new P({defines:{KERNEL_PAIRS:r.length},uniforms:{colorTexture:{value:null},invSize:{value:new F(.5,.5)},direction:{value:new F(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:r},gaussianWeights:{value:i}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new P({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};na.BlurDirectionX=new F(1,0),na.BlurDirectionY=new F(0,1);var ra={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},ia=class extends qi{constructor(){super(),this.isOutputPass=!0,this.uniforms=fe.clone(ra.uniforms),this.material=new Oe({name:ra.name,uniforms:this.uniforms,vertexShader:ra.vertexShader,fragmentShader:ra.fragmentShader}),this._fsQuad=new Xi(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Ie.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},aa={x:0,y:1,z:0},oa={x:1,y:.85,z:.6},sa=new I(0,1,0),ca=new I,la={sunDirWorld:sa,setSunColor(e){oa.x=e.r,oa.y=e.g,oa.z=e.b},updateCamera(e){ca.copy(sa).transformDirection(e.matrixWorldInverse),aa.x=ca.x,aa.y=ca.y,aa.z=ca.z},uniforms(){return{fogSunDir:{value:aa},fogSunColor:{value:oa}}}},ua=!1;function da(){if(ua)return;ua=!0,kt.fog_pars_vertex=`
#ifdef USE_FOG
  varying float vFogDepth;
  varying vec3 vFogViewPos;
#endif
`,kt.fog_vertex=`
#ifdef USE_FOG
  vFogDepth = - mvPosition.z;
  vFogViewPos = mvPosition.xyz;
#endif
`,kt.fog_pars_fragment=`
#ifdef USE_FOG
  uniform vec3 fogColor;
  uniform vec3 fogSunDir;
  uniform vec3 fogSunColor;
  varying float vFogDepth;
  varying vec3 vFogViewPos;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
  #endif
#endif
`,kt.fog_fragment=`
#ifdef USE_FOG
  #ifdef FOG_EXP2
    float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
  #else
    float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
  #endif
  vec3 fogDirV = normalize( vFogViewPos + vec3( 0.0, 0.0, -1e-4 ) );
  float fogSunAmt = pow( max( dot( fogDirV, fogSunDir ), 0.0 ), 5.0 );
  vec3 fogCol = mix( fogColor, fogSunColor, fogSunAmt );
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogCol, clamp( fogFactor, 0.0, 1.0 ) );
#endif
`;let e=la.uniforms();for(let t of Object.keys(At)){let n=At[t].uniforms;n&&n.fogColor&&Object.assign(n,e)}Object.assign(G.fog,e)}var fa=class extends qi{constructor(e=4){super(),this.scene=null,this.camera=null,this.needsSwap=!1,this.clear=!0,this.target=new je(1,1,{type:i,samples:e}),this.copyMat=new P(Ki),this.copyMat.depthTest=!1,this.copyMat.depthWrite=!1,this.fsQuad=new Xi(this.copyMat),this.beforeRender=null}setSize(e,t){this.target.setSize(e,t)}render(e,t,n){this.scene&&this.camera&&(this.beforeRender&&this.beforeRender(e),la.updateCamera(this.camera),e.setRenderTarget(this.target),e.clear(),e.render(this.scene,this.camera),this.copyMat.uniforms.tDiffuse.value=this.target.texture,e.setRenderTarget(this.renderToScreen?null:n),this.fsQuad.render(e))}dispose(){this.target.dispose(),this.copyMat.dispose(),this.fsQuad.dispose()}},pa={uniforms:{tDiffuse:{value:null},uRes:{value:new F(1,1)},uTime:{value:0},uBoost:{value:0},uSpeedLines:{value:0},uCA:{value:0},uFlash:{value:0},uFlashColor:{value:new B(1,1,1)},uVignette:{value:.35},uGrain:{value:.02},uSaturation:{value:1.08},uContrast:{value:1.04},uTint:{value:new B(1,1,1)},uLift:{value:new B(0,0,0)},uSunPos:{value:new F(.5,.5)},uSunVis:{value:0},uFlareColor:{value:new B(1,.8,.55)}},vertexShader:`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform vec2 uRes;
    uniform float uTime, uBoost, uSpeedLines, uCA, uFlash, uVignette, uGrain, uSaturation, uContrast;
    uniform vec3 uFlashColor, uTint, uLift;
    uniform vec2 uSunPos;
    uniform float uSunVis;
    uniform vec3 uFlareColor;
    varying vec2 vUv;
    vec3 lensFlare(vec2 uv, float aspect) {
      vec3 acc = vec3(0.0);
      vec2 sp = uSunPos;
      vec2 axis = vec2(0.5) - sp;
      // ghosts along the line through the screen centre
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float t = 0.35 + fi * 0.42;
        float r = 0.02 + 0.035 * mod(fi * 1.7, 3.0);
        vec2 c = sp + axis * t * 2.0;
        vec2 d = (uv - c) * vec2(aspect, 1.0);
        float g = smoothstep(r, r * 0.55, length(d));
        vec3 tint = mix(uFlareColor, vec3(0.55, 0.8, 1.0), fract(fi * 0.37));
        acc += tint * g * (0.05 + 0.03 * fi);
      }
      // ring halo around the centre-mirror point
      vec2 hc = sp + axis * 2.0;
      float hr = length((uv - hc) * vec2(aspect, 1.0));
      acc += uFlareColor * smoothstep(0.03, 0.0, abs(hr - 0.22)) * 0.04;
      // soft glare near the sun itself
      float sr = length((uv - sp) * vec2(aspect, 1.0));
      acc += uFlareColor * (0.12 / (1.0 + sr * sr * 60.0));
      return acc;
    }
    float hash12(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }
    void main() {
      vec2 c = vUv - 0.5;
      float aspect = uRes.x / max(uRes.y, 1.0);
      float r = length(c * vec2(aspect, 1.0));
      vec3 col;
      float blur = uBoost * 0.045 * smoothstep(0.12, 0.7, r);
      if (blur > 0.0004) {
        col = vec3(0.0);
        for (int i = 0; i < 8; i++) {
          float t = float(i) / 7.0;
          col += texture2D(tDiffuse, 0.5 + c * (1.0 - blur * t)).rgb;
        }
        col *= 0.125;
      } else {
        col = texture2D(tDiffuse, vUv).rgb;
      }
      float ca = uCA * r * r;
      if (ca > 0.00005) {
        col.r = texture2D(tDiffuse, vUv + c * ca).r * 0.7 + col.r * 0.3;
        col.b = texture2D(tDiffuse, vUv - c * ca).b * 0.7 + col.b * 0.3;
      }
      float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(l), col, uSaturation);
      col = (col - 0.5) * uContrast + 0.5;
      col = max(col, 0.0) * uTint + uLift;
      if (uSpeedLines > 0.001) {
        float ang = atan(c.y, c.x * aspect);
        float seg = floor(ang * 38.0);
        float n = hash12(vec2(seg, floor(uTime * 18.0)));
        float w = fract(ang * 38.0);
        float line = step(0.86, n) * smoothstep(0.0, 0.3, w) * smoothstep(1.0, 0.7, w);
        line *= smoothstep(0.32, 0.85, r);
        col = mix(col, vec3(1.0), line * uSpeedLines * 0.55);
      }
      if (uSunVis > 0.01) col += lensFlare(vUv, aspect) * uSunVis;
      col *= 1.0 - uVignette * smoothstep(0.38, 1.0, r);
      col = mix(col, uFlashColor, clamp(uFlash, 0.0, 1.0));
      col += (hash12(vUv * uRes + fract(uTime) * 100.0) - 0.5) * uGrain;
      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `},ma=class{constructor(e){da();let t=new Gi({antialias:!1,powerPreference:`high-performance`,stencil:!1});t.toneMapping=4,t.toneMappingExposure=1,t.outputColorSpace=oe,t.shadowMap.enabled=!0,t.shadowMap.type=1,t.setClearColor(0,1),e.appendChild(t.domElement),t.domElement.id=`game-canvas`,this.renderer=t,this.maxPixelRatio=Math.min(window.devicePixelRatio||1,2),this.pixelRatio=Math.min(this.maxPixelRatio,1.5),this.minPixelRatio=.7,this.adaptive=!0,this.composer=new ea(t,new je(1,1,{type:i})),this.scenePass=new fa(4),this.composer.addPass(this.scenePass),this.bloom=new na(new F(256,256),.45,.55,.95),this.composer.addPass(this.bloom),this.outputPass=new ia,this.composer.addPass(this.outputPass),this.fxPass=new Zi(pa),this.composer.addPass(this.fxPass),this.fx=this.fxPass.uniforms,this._frameTimes=[],this._lastAdjust=0,this._time=0,this.resize(),window.addEventListener(`resize`,()=>this.resize())}get domElement(){return this.renderer.domElement}setScene(e,t){this.scene=e,this.camera=t,this.scenePass.scene=e,this.scenePass.camera=t,this.resize()}setLook({exposure:e=1,bloomStrength:t=.45,bloomRadius:n=.55,bloomThreshold:r=.95,saturation:i=1.08,contrast:a=1.04,tint:o=[1,1,1],lift:s=[0,0,0],vignette:c=.35,grain:l=.02}={}){this.renderer.toneMappingExposure=e,this.bloom.strength=t,this.bloom.radius=n,this.bloom.threshold=r,this.fx.uSaturation.value=i,this.fx.uContrast.value=a,this.fx.uTint.value.setRGB(o[0],o[1],o[2]),this.fx.uLift.value.setRGB(s[0],s[1],s[2]),this.fx.uVignette.value=c,this.fx.uGrain.value=l}resize(){let e=window.innerWidth,t=window.innerHeight;this.renderer.setPixelRatio(this.pixelRatio),this.renderer.setSize(e,t),this.composer.setPixelRatio(this.pixelRatio),this.composer.setSize(e,t),this.fx.uRes.value.set(e*this.pixelRatio,t*this.pixelRatio),this.camera&&(this.camera.aspect=e/t,this.camera.updateProjectionMatrix())}_adapt(e,t){if(!this.adaptive||(this._frameTimes.push(e),this._frameTimes.length>90&&this._frameTimes.shift(),t-this._lastAdjust<2.5||this._frameTimes.length<60))return;let n=[...this._frameTimes].sort((e,t)=>e-t),r=n[Math.floor(n.length*.5)],i=this.pixelRatio;r>1/50?i=Math.max(this.minPixelRatio,this.pixelRatio-.15):r<1/70&&this.pixelRatio<this.maxPixelRatio&&(i=Math.min(this.maxPixelRatio,this.pixelRatio+.1)),Math.abs(i-this.pixelRatio)>.01&&(this.pixelRatio=i,this._lastAdjust=t,this._frameTimes.length=0,this.resize())}render(e){this._time+=e,this.fx.uTime.value=this._time,this.composer.render(e),this._adapt(e,this._time)}},ha=class{constructor(){this.keys=new Set,this.pressed=new Set,this.enabled=!0,this.gamepadIndex=null,this._padPrev={},this.padState={steer:0,accel:0,brake:0,jump:!1,item:!1,look:!1,pause:!1},this.menuActions=[],window.addEventListener(`keydown`,e=>{e.repeat||(this.keys.add(e.code),this.pressed.add(e.code),[`Space`,`ArrowUp`,`ArrowDown`,`ArrowLeft`,`ArrowRight`].includes(e.code)&&this.gameActive&&e.preventDefault())}),window.addEventListener(`keyup`,e=>{this.keys.delete(e.code)}),window.addEventListener(`blur`,()=>this.keys.clear()),window.addEventListener(`gamepadconnected`,e=>{this.gamepadIndex=e.gamepad.index}),this.gameActive=!1}down(...e){for(let t of e)if(this.keys.has(t))return!0;return!1}hit(...e){for(let t of e)if(this.pressed.has(t))return!0;return!1}pollGamepad(){let e=navigator.getGamepads?navigator.getGamepads():[],t=null;if(this.gamepadIndex!=null&&(t=e[this.gamepadIndex]),!t){for(let n of e)if(n){t=n,this.gamepadIndex=n.index;break}}let n=this.padState;if(!t){n.steer=0,n.accel=0,n.brake=0,n.jump=!1,n.item=!1,n.look=!1,n.pause=!1;return}let r=e=>t.buttons[e]?t.buttons[e].value>.5||t.buttons[e].pressed:!1,i=e=>t.buttons[e]?t.buttons[e].value:0,a=t.axes[0]||0;Math.abs(a)<.15&&(a=0),r(14)&&(a=-1),r(15)&&(a=1),n.steer=Math.max(-1,Math.min(1,a)),n.accel=Math.max(+!!r(0),i(7)),n.brake=Math.max(+!!r(1),+(i(6)>.5)),n.jump=r(5)||r(2),n.item=r(4),n.look=r(3),n.pause=r(9);let o=(e,t)=>{let n=this._padPrev[e];return this._padPrev[e]=t,t&&!n},s=t.axes[1]||0;o(`up`,r(12)||s<-.6)&&this.menuActions.push(`up`),o(`down`,r(13)||s>.6)&&this.menuActions.push(`down`),o(`left`,r(14)||a<-.6)&&this.menuActions.push(`left`),o(`right`,r(15)||a>.6)&&this.menuActions.push(`right`),o(`ok`,r(0))&&this.menuActions.push(`ok`),o(`back`,r(1))&&this.menuActions.push(`back`),o(`start`,r(9))&&this.menuActions.push(`start`),o(`jumpBtn`,n.jump)&&this.pressed.add(`PadJump`),o(`itemBtn`,n.item)&&this.pressed.add(`PadItem`)}controls(){let e=this.padState,t=0;this.down(`ArrowLeft`,`KeyA`)&&--t,this.down(`ArrowRight`,`KeyD`)&&(t+=1),t===0&&(t=e.steer);let n=this.down(`ArrowUp`,`KeyW`)?1:e.accel,r=this.down(`ArrowDown`,`KeyS`)?1:e.brake,i=this.down(`Space`,`ShiftLeft`,`ShiftRight`,`KeyK`)||e.jump,a=this.hit(`Space`,`ShiftLeft`,`ShiftRight`,`KeyK`,`PadJump`),o=this.hit(`KeyE`,`KeyX`,`KeyZ`,`KeyJ`,`PadItem`),s=this.down(`KeyC`)||e.look;return{steer:t,accel:n,brake:r,jump:i,jumpPressed:a,itemPressed:o,lookBack:s}}pausePressed(){return this.hit(`Escape`,`KeyP`)||this.menuActions.includes(`start`)}endFrame(){this.pressed.clear(),this.menuActions.length=0}},ga=new I,_a=class e{constructor(e){this.def=e;let t=e.points,n=t.length;this.cpCount=n,this.defaultWidth=e.width??8;let r=t.map(e=>new I(e[0],e[1],e[2])),i=new Ne(r,!0,`centripetal`),a=n*96;i.arcLengthDivisions=a;let o=i.getLengths(a),s=o[o.length-1];this.curve=i,this.length=s,this.cpS=[];for(let e=0;e<n;e++)this.cpS.push(o[e*96]);this.cpS.push(s);let c=e.sampleSpacing??1,l=Math.max(64,Math.round(s/c));this.count=l,this.ds=s/l;let u=i.getSpacedPoints(l),d=e=>new Float32Array(l);this.px=d(),this.py=d(),this.pz=d(),this.tx=d(),this.ty=d(),this.tz=d(),this.rx=d(),this.ry=d(),this.rz=d(),this.ux=d(),this.uy=d(),this.uz=d(),this.w=d(),this.bank=d(),this.curv=d(),this.heading=d(),this.wallL=d(),this.wallR=d(),this.flags=new Uint16Array(l);for(let e=0;e<l;e++){let t=u[e];this.px[e]=t.x,this.py[e]=t.y,this.pz[e]=t.z}for(let e=0;e<l;e++){let t=e*this.ds,{w:n,bank:r}=this._cpAttr(t);this.w[e]=n,this.bank[e]=r}for(let e=0;e<l;e++){let t=(e-1+l)%l,n=(e+1)%l;ga.set(this.px[n]-this.px[t],this.py[n]-this.py[t],this.pz[n]-this.pz[t]).normalize(),this.tx[e]=ga.x,this.ty[e]=ga.y,this.tz[e]=ga.z,this.heading[e]=Math.atan2(ga.x,ga.z)}let f=new Float32Array(l);for(let e=0;e<l;e++){let t=(e-2+l)%l,n=(e+2)%l,r=this.heading[n]-this.heading[t];for(;r>Math.PI;)r-=Math.PI*2;for(;r<-Math.PI;)r+=Math.PI*2;f[e]=-r/(4*this.ds)}for(let e=0;e<l;e++){let t=0;for(let n=-6;n<=6;n++)t+=f[(e+n+l)%l];this.curv[e]=t/13}let p=new I,m=new I,h=new I;for(let e=0;e<l;e++){p.set(this.tx[e],this.ty[e],this.tz[e]),m.crossVectors(p,ve.DEFAULT_UP).normalize(),h.crossVectors(m,p).normalize();let t=this.bank[e],n=Math.cos(t),r=Math.sin(t),i=m.x*n-h.x*r,a=m.y*n-h.y*r,o=m.z*n-h.z*r,s=h.x*n+m.x*r,c=h.y*n+m.y*r,l=h.z*n+m.z*r;this.rx[e]=i,this.ry[e]=a,this.rz[e]=o,this.ux[e]=s,this.uy[e]=c,this.uz[e]=l}let g=e.wallMargin??16;for(let e=0;e<l;e++)this.wallL[e]=this.w[e]+g,this.wallR[e]=this.w[e]+g;this.gaps=[],this.bridges=[],this.ramps=[],this.boosts=[],this.itemRows=[],this.coinLines=[],this.zones=e.zones||{},this._buildZones(this.zones),this.bounds=new ye;for(let e=0;e<l;e++)this.bounds.expandByPoint(ga.set(this.px[e],this.py[e],this.pz[e]))}_cpAttr(e){let t=this.def.points,n=this.cpCount,r=0;for(;r<n-1&&this.cpS[r+1]<=e;)r++;let i=this.cpS[r],a=this.cpS[r+1],o=(e-i)/Math.max(1e-6,a-i);o=o*o*(3-2*o);let s=t[r],c=t[(r+1)%n],l=s[3]??this.defaultWidth,u=c[3]??this.defaultWidth,d=s[4]??0,f=c[4]??0;return{w:l+(u-l)*o,bank:d+(f-d)*o}}cpToS(e){let t=this.cpCount,n=(e%t+t)%t,r=Math.floor(n),i=n-r;return this.cpS[r]+(this.cpS[r+1]-this.cpS[r])*i}_sOf(e){return typeof e==`number`?this.cpToS(e):e.s==null?this.cpToS(e.cp)+(e.off||0):this.wrapS(e.s)}wrapS(e){let t=this.length;return(e%t+t)%t}idx(e){return(Math.floor(this.wrapS(e)/this.ds)%this.count+this.count)%this.count}_forRange(e,t,n){let r=t-e;r<0&&(r+=this.length);let i=Math.ceil(r/this.ds),a=this.idx(e);for(let e=0;e<=i;e++)n((a+e)%this.count,e/Math.max(1,i))}_buildZones(t){let n=e.FLAGS;for(let e of t.gaps||[]){let t=this._sOf(e.from),r=this._sOf(e.to);this.gaps.push({s0:t,s1:r,respawn:e.respawn==null?this.wrapS(r+6):this._sOf(e.respawn),killY:e.killY??-3}),this._forRange(t,r,e=>this.flags[e]|=n.GAP|n.NO_TERRAIN_FOLLOW)}for(let e of t.bridges||[]){let t=this._sOf(e.from),r=this._sOf(e.to);this.bridges.push({s0:t,s1:r,style:e.style||`stone`,rail:e.rail??!0}),this._forRange(t-2,r+2,t=>{this.flags[t]|=n.BRIDGE|n.NO_TERRAIN_FOLLOW,(e.rail??!0)&&(this.wallL[t]=Math.min(this.wallL[t],this.w[t]+.1),this.wallR[t]=Math.min(this.wallR[t],this.w[t]+.1))})}for(let e of t.ramps||[]){let t=this._sOf(e.at);this.ramps.push({s:t,len:e.len??10,h:e.h??1.6,d0:e.d0??-4,d1:e.d1??4,type:e.type||`jump`,launch:e.launch??(e.type===`glide`?11:8.5)})}for(let e of t.boosts||[])this.boosts.push({s:this._sOf(e.at),d:e.d??0,len:e.len??5,halfW:e.halfW??1.6});for(let e of t.items||[])this.itemRows.push({s:this._sOf(e.at),count:e.count??4,spread:e.spread??null,d:e.d??0});for(let e of t.coins||[])this.coinLines.push({s0:this._sOf(e.from),s1:this._sOf(e.to),d:e.d??0,count:e.count??5,wave:e.wave??0,h:e.h??.85,arc:e.arc??0});for(let e of t.walls||[]){let t=this._sOf(e.from),n=this._sOf(e.to),r=e.side||`both`;this._forRange(t,n,t=>{let n=e.offset==null?this.w[t]+1:this.w[t]+e.offset;(r===`left`||r===`both`)&&(this.wallL[t]=Math.min(this.wallL[t],e.abs==null?n:e.abs)),(r===`right`||r===`both`)&&(this.wallR[t]=Math.min(this.wallR[t],e.abs==null?n:e.abs))})}}inGap(e){for(let t of this.gaps)if(t.s0<=t.s1?e>=t.s0&&e<=t.s1:e>=t.s0||e<=t.s1)return t;return null}hasFlag(e,t){return(this.flags[e]&t)!==0}frameAt(t,n=e.newFrame()){t=this.wrapS(t);let r=t/this.ds,i=Math.floor(r)%this.count,a=(i+1)%this.count,o=r-Math.floor(r),s=(e,t)=>e+(t-e)*o;return n.pos.set(s(this.px[i],this.px[a]),s(this.py[i],this.py[a]),s(this.pz[i],this.pz[a])),n.tan.set(s(this.tx[i],this.tx[a]),s(this.ty[i],this.ty[a]),s(this.tz[i],this.tz[a])).normalize(),n.right.set(s(this.rx[i],this.rx[a]),s(this.ry[i],this.ry[a]),s(this.rz[i],this.rz[a])).normalize(),n.up.set(s(this.ux[i],this.ux[a]),s(this.uy[i],this.uy[a]),s(this.uz[i],this.uz[a])).normalize(),n.width=s(this.w[i],this.w[a]),n.wallL=s(this.wallL[i],this.wallL[a]),n.wallR=s(this.wallR[i],this.wallR[a]),n.curv=s(this.curv[i],this.curv[a]),n.index=i,n.s=t,n}static newFrame(){return{pos:new I,tan:new I,right:new I,up:new I,width:8,wallL:20,wallR:20,curv:0,index:0,s:0}}pointAt(e,t,n=0,r=new I){let i=this.frameAt(e,va);return r.copy(i.pos).addScaledVector(i.right,t).addScaledVector(i.up,n)}project(t,n,r,i=-1,a=e.newProj()){let o=-1,s=1/0,c=this.count,l=e=>{let i=t-this.px[e],a=r-this.pz[e],c=(n-this.py[e])*1.5,l=i*i+a*a+c*c;l<s&&(s=l,o=e)};if(i>=0){for(let e=-45;e<=45;e++)l((i+e+c)%c);s>1600&&(i=-1)}if(i<0){s=1/0;for(let e=0;e<c;e++)l(e)}let u=o,d=this.tx[u],f=this.tz[u],p=(t-this.px[u])*d+(r-this.pz[u])*f,m=u*this.ds+p/Math.max(.2,Math.hypot(d,f));m=this.wrapS(m);let h=this.frameAt(m,a.frame),g=t-h.pos.x,_=n-h.pos.y,v=r-h.pos.z,y=Math.hypot(h.right.x,h.right.z)||1,b=(g*h.right.x+v*h.right.z)/y;return a.index=h.index,a.s=m,a.d=b,a.width=h.width,a.roadY=h.pos.y+h.right.y/y*b,a.dy=_,a}static newProj(){return{index:0,s:0,d:0,width:8,roadY:0,dy:0,frame:e.newFrame()}}rampAt(e,t){for(let n of this.ramps){let r=e-n.s;if(r<-this.length/2&&(r+=this.length),r>this.length/2&&(r-=this.length),r<0||r>n.len||t<n.d0||t>n.d1)continue;let i=r/n.len;return{h:n.h*i**1.35,ramp:n,f:i}}return null}boostAt(e,t){for(let n of this.boosts){let r=e-n.s;if(r<-this.length/2&&(r+=this.length),r>=0&&r<=n.len&&Math.abs(t-n.d)<=n.halfW)return n}return null}forwardDist(e,t){let n=t-e;return n<0&&(n+=this.length),n}deltaS(e,t){let n=t-e,r=this.length;return n>r/2&&(n-=r),n<=-r/2&&(n+=r),n}minimapPath(e=6){let t=[];for(let n=0;n<this.count;n+=e)t.push([this.px[n],this.pz[n]]);return t}};_a.FLAGS={GAP:1,BRIDGE:2,NO_TERRAIN_FOLLOW:4,TUNNEL:8};var va=_a.newFrame(),ya=class{constructor(e,t,n){this.track=e,this.terrain=t,this.stage=n,this._ts={}}query(e,t,n,r,i){let a=this.track;i.proj||=_a.newProj(),i.normal||=new I;let o=a.project(e,t,n,r,i.proj);i.ramp=null,i.waterY=-1/0,i.roadY=o.roadY;let s=o.index,c=(a.flags[s]&_a.FLAGS.GAP)!==0,l=o.width;if(!c&&Math.abs(o.d)<=l+.02&&t>o.roadY-2.5){let e=o.roadY;i.normal.copy(o.frame.up);let t=a.rampAt(o.s,o.d);if(t){e+=t.h,i.ramp=t.ramp;let n=t.ramp,r=Math.max(.001,t.f),a=n.h*1.35*r**.35/n.len;i.normal.addScaledVector(o.frame.tan,-a).normalize()}return i.y=e,i.surface=`road`,i}let u=this.terrain.sample(e,n,this._ts);i.y=u.h,this.terrain.normalAt(e,n,i.normal);let d=this.stage.waterLevelAt?this.stage.waterLevelAt(e,n):-1/0;return i.waterY=d,i.surface=d>u.h+.05?d-u.h>1?`deep`:this.stage.shallowWater||`water`:this.stage.surfaceAt?this.stage.surfaceAt(e,n,u):`grass`,i}};function ba(e){let t=e>>>0||1;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function xa(t,n,r=8){let i=new ft(t);return i.wrapS=i.wrapT=Re,i.colorSpace=n?oe:``,i.anisotropy=r,i.generateMipmaps=!0,i.minFilter=e,i.needsUpdate=!0,i}function Sa(e,t=2){let n=e.width,r=e.height,i=e.getContext(`2d`).getImageData(0,0,n,r).data,a=document.createElement(`canvas`);a.width=n,a.height=r;let o=a.getContext(`2d`),s=o.createImageData(n,r),c=(e,t)=>i[((t+r)%r*n+(e+n)%n)*4]/255;for(let e=0;e<r;e++)for(let r=0;r<n;r++){let i=(c(r+1,e)-c(r-1,e))*t,a=(c(r,e+1)-c(r,e-1))*t,o=-i,l=a,u=1,d=Math.hypot(o,l,u);o/=d,l/=d,u/=d;let f=(e*n+r)*4;s.data[f]=(o*.5+.5)*255,s.data[f+1]=(l*.5+.5)*255,s.data[f+2]=(u*.5+.5)*255,s.data[f+3]=255}return o.putImageData(s,0,0),a}var Ca=new Map;function wa(e={}){let t=`asphalt:`+JSON.stringify(e);if(Ca.has(t))return Ca.get(t);let n=1024,r=1024,i=ba(e.seed??3),a=document.createElement(`canvas`);a.width=n,a.height=r;let o=a.getContext(`2d`),s=document.createElement(`canvas`);s.width=n,s.height=r;let c=s.getContext(`2d`);c.fillStyle=`#808080`,c.fillRect(0,0,n,r),o.fillStyle=e.tone||`#55565a`,o.fillRect(0,0,n,r);for(let e=0;e<60;e++){let e=i()*n,t=i()*r,a=40+i()*160,s=i()<.5?0:255,c=o.createRadialGradient(e,t,0,e,t,a);c.addColorStop(0,`rgba(${s},${s},${s},${.035+i()*.04})`),c.addColorStop(1,`rgba(${s},${s},${s},0)`),o.fillStyle=c,o.fillRect(e-a,t-a,a*2,a*2)}for(let e=0;e<9e4;e++){let e=i()*n,t=i()*r,a=.8+i()*1.4;if(i()>.6){let e=95+i()*55;o.fillStyle=`rgba(${e},${e},${e+3},${.12+i()*.22})`,c.fillStyle=`rgba(255,255,255,${.2+i()*.3})`}else{let e=25+i()*25;o.fillStyle=`rgba(${e},${e},${e},${.12+i()*.2})`,c.fillStyle=`rgba(0,0,0,${.15+i()*.25})`}o.fillRect(e,t,a,a),c.fillRect(e,t,a,a)}let l=e.wear??.6;for(let e of[.28,.4,.6,.72]){let t=o.createLinearGradient((e-.06)*n,0,(e+.06)*n,0);t.addColorStop(0,`rgba(0,0,0,0)`),t.addColorStop(.5,`rgba(20,20,25,${.16*l})`),t.addColorStop(1,`rgba(0,0,0,0)`),o.fillStyle=t,o.fillRect((e-.06)*n,0,.12*n,r)}o.lineCap=`round`;for(let e=0;e<26;e++){let e=i()*n,t=i()*r;o.strokeStyle=`rgba(15,15,18,${.35+i()*.3})`,c.strokeStyle=`rgba(0,0,0,0.6)`,o.lineWidth=c.lineWidth=1+i()*1.5,o.beginPath(),c.beginPath(),o.moveTo(e,t),c.moveTo(e,t);let a=4+Math.floor(i()*8);for(let n=0;n<a;n++)e+=(i()-.5)*50,t+=(i()-.5)*50,o.lineTo(e,t),c.lineTo(e,t);o.stroke(),c.stroke()}for(let e=0;e<5;e++){let e=i()*n*.8+n*.1,t=i()*r,a=60+i()*140,s=50+i()*200;o.fillStyle=`rgba(${30+i()*20},${30+i()*20},${34+i()*20},0.45)`,o.fillRect(e,t,a,s),o.strokeStyle=`rgba(10,10,10,0.35)`,o.lineWidth=2,o.strokeRect(e,t,a,s)}let u=(e,t,a,s,l)=>{o.fillStyle=l,o.fillRect(e*n,a*r,(t-e)*n,(s-a)*r),c.fillStyle=`rgba(255,255,255,0.35)`,c.fillRect(e*n,a*r,(t-e)*n,(s-a)*r);for(let c=0;c<700;c++)o.fillStyle=`rgba(60,60,64,${i()*.55})`,o.fillRect((e+i()*(t-e))*n,(a+i()*(s-a))*r,2+i()*3,2+i()*3)},d=e.lineColor||`rgba(236,236,228,0.92)`;(e.lines??`white`)!==`none`&&(u(.035,.055,0,1,d),u(.945,.965,0,1,d));let f=e.center??`dash`;if(f===`dash`?(u(.492,.508,0,.3,d),u(.492,.508,.5,.8,d)):f===`solid`&&u(.49,.51,0,1,e.centerColor||`rgba(240,190,40,0.95)`),e.edgeDirt)for(let t of[0,1]){let i=o.createLinearGradient(t?n:0,0,t?n*.9:n*.1,0);i.addColorStop(0,e.edgeDirt),i.addColorStop(1,`rgba(0,0,0,0)`),o.fillStyle=i,o.fillRect(t?n*.9:0,0,n*.1,r)}let p={map:xa(a,!0),normalMap:xa(Sa(s,2.5),!1)};return Ca.set(t,p),p}function Ta(e={}){let t=`stone:`+JSON.stringify(e);if(Ca.has(t))return Ca.get(t);let n=1024,r=1024,i=ba(e.seed??5),a=document.createElement(`canvas`);a.width=n,a.height=r;let o=a.getContext(`2d`),s=document.createElement(`canvas`);s.width=n,s.height=r;let c=s.getContext(`2d`);o.fillStyle=e.grout||`#4a463f`,o.fillRect(0,0,n,r),c.fillStyle=`#202020`,c.fillRect(0,0,n,r);let l=e.rows??14,u=r/l;for(let t=0;t<l;t++){let r=-i()*80;for(;r<n;){let a=70+i()*90,s=e.hue??35,l=48+i()*18;o.fillStyle=`hsl(${s+(i()-.5)*12},${6+i()*10}%,${l}%)`;let d=r+5,f=t*u+5,p=a-10,m=u-10,h=e=>{e.beginPath(),e.moveTo(d+10,f),e.arcTo(d+p,f,d+p,f+m,10),e.arcTo(d+p,f+m,d,f+m,10),e.arcTo(d,f+m,d,f,10),e.arcTo(d,f,d+p,f,10),e.closePath()};h(o),o.fill();let g=c.createRadialGradient(d+p/2,f+m/2,0,d+p/2,f+m/2,Math.max(p,m)*.7);g.addColorStop(0,`#f0f0f0`),g.addColorStop(1,`#a0a0a0`),c.fillStyle=g,h(c),c.fill();for(let e=0;e<60;e++)o.fillStyle=`rgba(${i()<.5?0:255},${i()<.5?0:255},${i()<.5?0:255},${i()*.05})`,o.fillRect(d+i()*p,f+i()*m,3+i()*6,3+i()*6);r+a>n&&(o.save(),o.translate(-1024,0),h(o),o.fill(),o.restore(),c.save(),c.translate(-1024,0),h(c),c.fill(),c.restore()),r+=a}}if(e.moss)for(let e=0;e<2500;e++){o.fillStyle=`rgba(70,95,40,${i()*.25})`;let e=i()*n,t=Math.floor(i()*l)*u-3+i()*6;o.fillRect(e,t,3+i()*8,2+i()*4)}let d={map:xa(a,!0),normalMap:xa(Sa(s,3),!1)};return Ca.set(t,d),d}function Ea(){if(Ca.has(`dash`))return Ca.get(`dash`);let e=document.createElement(`canvas`);e.width=256,e.height=256;let t=e.getContext(`2d`),n=t.createLinearGradient(0,0,0,256);n.addColorStop(0,`#ff7a00`),n.addColorStop(1,`#ffb000`),t.fillStyle=n,t.fillRect(0,0,256,256),t.fillStyle=`#fff6c0`;for(let e=0;e<2;e++){let n=e*256/2;t.beginPath(),t.moveTo(30.72,n+92.16),t.lineTo(128,n+15.36),t.lineTo(225.28,n+92.16),t.lineTo(225.28,n+117.76),t.lineTo(128,n+51.2),t.lineTo(30.72,n+117.76),t.closePath(),t.fill()}t.strokeStyle=`rgba(120,40,0,0.8)`,t.lineWidth=10,t.strokeRect(0,-10,256,276);let r=xa(e,!0);return Ca.set(`dash`,r),r}function Da(){if(Ca.has(`checker`))return Ca.get(`checker`);let e=document.createElement(`canvas`);e.width=512,e.height=64;let t=e.getContext(`2d`);for(let e=0;e<16;e++)for(let n=0;n<2;n++)t.fillStyle=(e+n)%2?`#1c1c1c`:`#f2f2ee`,t.fillRect(e*512/16,n*32,32,32);let n=xa(e,!0);return n.wrapT=qe,Ca.set(`checker`,n),n}function Oa(){if(Ca.has(`plank`))return Ca.get(`plank`);let e=ba(9),t=document.createElement(`canvas`);t.width=512,t.height=512;let n=t.getContext(`2d`),r=document.createElement(`canvas`);r.width=512,r.height=512;let i=r.getContext(`2d`);for(let t=0;t<8;t++){let r=t*512/8,a=45+e()*15;n.fillStyle=`hsl(28,${35+e()*15}%,${a}%)`,n.fillRect(0,r,512,64),i.fillStyle=`#c0c0c0`,i.fillRect(0,r+3,512,58);for(let t=0;t<40;t++){n.strokeStyle=`rgba(60,35,15,${.1+e()*.2})`,n.lineWidth=1,n.beginPath();let t=r+e()*64;n.moveTo(0,t),n.bezierCurveTo(153.6,t+(e()-.5)*8,307.2,t+(e()-.5)*8,512,t),n.stroke()}n.fillStyle=`rgba(30,18,8,0.8)`,n.fillRect(0,r,512,3);for(let e of[51.2,460.8])n.fillStyle=`rgba(40,40,40,0.9)`,n.beginPath(),n.arc(e,r+32,4,0,Math.PI*2),n.fill()}let a={map:xa(t,!0),normalMap:xa(Sa(r,2),!1)};return Ca.set(`plank`,a),a}var ka=new Map,Aa=new Map;function ja(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function Ma(e,t,n,r,i={}){if(Aa.has(e))return Aa.get(e);let a=document.createElement(`canvas`);a.width=t,a.height=n,r(a.getContext(`2d`),t,n);let o=new ft(a);return o.wrapS=o.wrapT=Re,o.colorSpace=i.srgb===!1?``:oe,o.anisotropy=8,i.repeat&&o.repeat.set(i.repeat[0],i.repeat[1]),o.needsUpdate=!0,Aa.set(e,o),o}var Na={wood:()=>Ma(`wood`,256,256,(e,t,n)=>{let r=ja(11);e.fillStyle=`#d8d0c4`,e.fillRect(0,0,t,n);for(let i=0;i<90;i++){let i=r()*t;e.strokeStyle=`rgba(60,40,20,${.05+r()*.12})`,e.lineWidth=.6+r()*2.2,e.beginPath(),e.moveTo(i,0);let a=i;for(let t=0;t<=n;t+=16)a+=(r()-.5)*2.5,e.lineTo(a,t);e.stroke()}e.fillStyle=`rgba(30,20,10,0.35)`;for(let r=0;r<t;r+=64)e.fillRect(r,0,2,n)}),thatch:()=>Ma(`thatch`,256,256,(e,t,n)=>{let r=ja(23);e.fillStyle=`#cdbb98`,e.fillRect(0,0,t,n);for(let i=0;i<2600;i++){let i=r()*t,a=r()*n,o=10+r()*26,s=40+r()*50;e.strokeStyle=`hsla(${38+r()*10},${30+r()*25}%,${s}%,0.55)`,e.lineWidth=.8+r()*1.2,e.beginPath(),e.moveTo(i,a),e.lineTo(i+(r()-.5)*3,a+o),e.stroke()}e.fillStyle=`rgba(60,40,20,0.18)`;for(let r=0;r<n;r+=64)e.fillRect(0,r,t,5)}),kawara:()=>Ma(`kawara`,256,256,(e,t,n)=>{e.fillStyle=`#bfc3c8`,e.fillRect(0,0,t,n);let r=t/8,i=n/8;for(let n=0;n<8;n++){for(let t=0;t<8;t++){let a=t*r,o=n*i,s=e.createLinearGradient(a,0,a+r,0);s.addColorStop(0,`rgba(40,45,50,0.55)`),s.addColorStop(.35,`rgba(255,255,255,0.25)`),s.addColorStop(.7,`rgba(0,0,0,0.05)`),s.addColorStop(1,`rgba(40,45,50,0.6)`),e.fillStyle=s,e.fillRect(a,o,r,i)}e.fillStyle=`rgba(20,22,25,0.55)`,e.fillRect(0,n*i+i-4,t,4)}}),plaster:()=>Ma(`plaster`,256,256,(e,t,n)=>{let r=ja(5);e.fillStyle=`#f2efe8`,e.fillRect(0,0,t,n);for(let i=0;i<500;i++){e.fillStyle=`rgba(120,110,95,${r()*.05})`;let i=4+r()*30;e.beginPath(),e.arc(r()*t,r()*n,i,0,Math.PI*2),e.fill()}}),stone:()=>Ma(`stone`,256,256,(e,t,n)=>{let r=ja(77);e.fillStyle=`#6d6c68`,e.fillRect(0,0,t,n);for(let i=0;i<6;i++){let a=-r()*40,o=n/6;for(;a<t;){let t=30+r()*50,n=62+r()*22;e.fillStyle=`hsl(40,${4+r()*6}%,${n}%)`,e.fillRect(a+2,i*o+2,t-4,o-4);for(let n=0;n<20;n++)e.fillStyle=`rgba(0,0,0,${r()*.06})`,e.fillRect(a+2+r()*(t-6),i*o+2+r()*(o-6),3,3);a+=t}}}),washi:()=>Ma(`washi`,256,256,(e,t,n)=>{let r=ja(9);e.fillStyle=`#f7f3ea`,e.fillRect(0,0,t,n);for(let i=0;i<400;i++){e.strokeStyle=`rgba(150,130,100,${r()*.12})`,e.lineWidth=.5+r(),e.beginPath();let i=r()*t,a=r()*n;e.moveTo(i,a),e.quadraticCurveTo(i+(r()-.5)*30,a+(r()-.5)*30,i+(r()-.5)*40,a+(r()-.5)*40),e.stroke()}}),bark:()=>Ma(`bark`,128,256,(e,t,n)=>{let r=ja(31);e.fillStyle=`#c9bfb4`,e.fillRect(0,0,t,n);for(let i=0;i<160;i++)e.fillStyle=`rgba(40,30,20,${.08+r()*.2})`,e.fillRect(r()*t,r()*n,1+r()*4,10+r()*40)})},Pa={vermilion:{color:14172191,roughness:.55},vermilionDark:{color:10103576,roughness:.6},blackLacquer:{color:1907225,roughness:.35},gold:{color:14725194,metalness:1,roughness:.28},brass:{color:12094012,metalness:1,roughness:.4},woodLight:{color:14070924,roughness:.8,map:`wood`},wood:{color:10779218,roughness:.82,map:`wood`},woodDark:{color:6177328,roughness:.85,map:`wood`},woodAged:{color:9075304,roughness:.9,map:`wood`},plaster:{color:15986404,roughness:.95,map:`plaster`},kawara:{color:5857387,roughness:.5,metalness:.2,map:`kawara`},kawaraPlain:{color:5067612,roughness:.5,metalness:.2},thatch:{color:12096610,roughness:1,map:`thatch`},straw:{color:14467194,roughness:1,map:`thatch`},stone:{color:10724251,roughness:.95,map:`stone`},stonePlain:{color:10197908,roughness:.95},stoneDark:{color:7105896,roughness:.95},moss:{color:6257722,roughness:1},concrete:{color:12368304,roughness:.95},metal:{color:12830668,metalness:.85,roughness:.4},metalDark:{color:3882821,metalness:.75,roughness:.45},paintWhite:{color:16053488,roughness:.45},paintYellow:{color:15909166,roughness:.45},paintBlack:{color:1842206,roughness:.5},paintRed:{color:13773346,roughness:.45},paintBlue:{color:2843320,roughness:.45},paintGreen:{color:4165450,roughness:.5},paper:{color:16249315,roughness:.9,map:`washi`},fabricRed:{color:13116972,roughness:.9},fabricIndigo:{color:2374251,roughness:.9},fabricWhite:{color:15921126,roughness:.9},rope:{color:14073994,roughness:1,map:`thatch`},leaf:{color:5212725,roughness:.85},leafDark:{color:3037996,roughness:.9},leafLight:{color:8368714,roughness:.85},sakura:{color:16236496,roughness:.85},sakuraDeep:{color:15636659,roughness:.85},bark:{color:6047800,roughness:1,map:`bark`},barkDark:{color:3878438,roughness:1,map:`bark`},bamboo:{color:8366150,roughness:.55},glass:{color:2765888,roughness:.08,metalness:.3},rubber:{color:1710618,roughness:.8},water:{color:3828344,roughness:.05,metalness:.1},lanternGlow:{color:16769712,emissive:16751164,emissiveIntensity:2.2,roughness:.9,map:`washi`},lanternGlowRed:{color:16747114,emissive:16726556,emissiveIntensity:2.4,roughness:.9,map:`washi`},windowGlow:{color:16769192,emissive:16757850,emissiveIntensity:1.6,roughness:.9},lightWhite:{color:16777215,emissive:16774368,emissiveIntensity:3,roughness:.5},lightRed:{color:16724e3,emissive:16719888,emissiveIntensity:4,roughness:.5}};Object.keys(Pa);function Fa(e){let t={...e};return typeof t.map==`string`&&(t.map=Na[t.map]()),new R(t)}function Ia(e){if(ka.has(e))return ka.get(e);let t=Pa[e];if(!t)throw Error(`Unknown palette material: ${e}`);let n=Fa(t);return n.name=e,ka.set(e,n),n}function La(e,t){if(ka.has(e))return ka.get(e);let n=t&&t.isMaterial?t:Fa(t||{});return n.name=e,ka.set(e,n),n}var Ra=new I;function za(e,t,n,r,i,{uScale:a=1,vScale:o=10,flip:s=!1}={}){let c=n-t;c<0&&(c+=e.length);let l=Math.max(1,Math.ceil(c/r)),u=[];for(let n=0;n<=l;n++){let r=t+c*n/l,a=e.frameAt(r,{pos:new I,tan:new I,right:new I,up:new I});u.push({fr:a,pts:i(a,r,n/l),v:(r-t)/o+t/o})}let d=u[0].pts.length-1,f=[],p=[],m=[],h=0;for(let e=0;e<d;e++){let t=u[0].pts,n=0;for(let r=0;r<e;r++)n+=Math.hypot(t[r+1][0]-t[r][0],t[r+1][1]-t[r][1]);let r=n+Math.hypot(t[e+1][0]-t[e][0],t[e+1][1]-t[e][1]);for(let t=0;t<=l;t++){let{fr:i,pts:o,v:s}=u[t];for(let[t,c]of[[e,n],[e+1,r]]){let[e,n]=o[t];Ra.copy(i.pos).addScaledVector(i.right,e).addScaledVector(i.up,n),f.push(Ra.x,Ra.y,Ra.z),p.push(c/a,s)}}for(let e=0;e<l;e++){let t=h+e*2,n=t+1,r=t+2,i=t+3;s?m.push(t,r,n,n,r,i):m.push(t,n,r,n,i,r)}h+=(l+1)*2}let g=new we;return g.setAttribute(`position`,new M(f,3)),g.setAttribute(`uv`,new M(p,2)),g.setIndex(m),g.computeVertexNormals(),g}function Ba(e,t,n,r,i,a){let o=e.frameAt(t),s=(e,t)=>o.pos.clone().addScaledVector(o.right,e).addScaledVector(o.up,t),c=s(n,i),l=s(r,i),u=s(r,a),d=s(n,a),f=new we;return f.setAttribute(`position`,new M([c.x,c.y,c.z,l.x,l.y,l.z,u.x,u.y,u.z,d.x,d.y,d.z],3)),f.setAttribute(`uv`,new M([0,0,1,0,1,1,0,1],2)),f.setIndex([0,3,2,0,2,1]),f.computeVertexNormals(),f}function Va(e){let t=[],n=[...e.gaps].sort((e,t)=>e.s0-t.s0);if(!n.length)return[[0,e.length]];for(let r=0;r<n.length;r++){let i=n[r].s1,a=n[(r+1)%n.length].s0;t.push([i,a<=i?a+e.length:a])}return t}function Ha(e,t={},n=null){let r=new W;r.name=`track`;let i=t.texLen??16,a;a=t.road===`stone`?Ta(t.roadOpts||{}):wa(t.roadOpts||{});let o=new R({map:a.map,normalMap:a.normalMap,normalScale:new F(.8,.8),roughness:t.roadRoughness??.82,metalness:0,color:t.roadColor??16777215});o.name=`road`;let s=Va(e),c=[],l=[];for(let[t,n]of s)c.push(za(e,t,n,1,e=>[[-e.width,0],[e.width,0]],{uScale:1,vScale:i})),l.push(za(e,t,n,2,e=>[[-e.width,-.9],[-e.width,.02]],{vScale:4}),za(e,t,n,2,e=>[[e.width,.02],[e.width,-.9]],{vScale:4}));let u=t.road===`stone`,d=t.tile??4.2;for(let e of c){let t=e.attributes.uv,n=e.attributes.position;for(let e=0;e<t.count;e++)if(u){if(e%2==1){let r=n.getX(e)-n.getX(e-1),i=n.getZ(e)-n.getZ(e-1);t.setX(e-1,0),t.setX(e,Math.hypot(r,i)/d)}t.setY(e,t.getY(e)*i/d)}else t.setX(e,e%2==0?0:1)}let f=ut(c),p=new U(f,o);p.receiveShadow=!0,p.name=`road`,r.add(p);let m=new U(ut(l),Ia(t.skirtMat||`stoneDark`));if(m.receiveShadow=!0,r.add(m),t.curbs){let n=(()=>{let e=document.createElement(`canvas`);e.width=64,e.height=256;let n=e.getContext(`2d`);for(let e=0;e<4;e++)n.fillStyle=e%2?t.curbs[0]:t.curbs[1],n.fillRect(0,e*64,64,64);let r=new ft(e);return r.wrapS=r.wrapT=Re,r.colorSpace=oe,r.anisotropy=8,r})(),i=new R({map:n,roughness:.6}),a=[];for(let[t,n]of s)a.push(za(e,t,n,1,e=>[[-e.width-.2,0],[-e.width+.6,.06],[-e.width+.9,0]],{vScale:4})),a.push(za(e,t,n,1,e=>[[e.width-.9,0],[e.width-.6,.06],[e.width+.2,0]],{vScale:4}));let o=new U(ut(a),i);o.receiveShadow=!0,r.add(o)}let h=Oa(),g=new R({map:h.map,normalMap:h.normalMap,roughness:.75,color:16777215}),_=(()=>{let e=document.createElement(`canvas`);e.width=256,e.height=256;let t=e.getContext(`2d`);t.fillStyle=`#1b6fd6`,t.fillRect(0,0,256,256),t.fillStyle=`#7fe8ff`;for(let e=0;e<2;e++){let n=e*128+20;t.beginPath(),t.moveTo(40,n+70),t.lineTo(128,n),t.lineTo(216,n+70),t.lineTo(216,n+92),t.lineTo(128,n+24),t.lineTo(40,n+92),t.closePath(),t.fill()}let n=new ft(e);return n.wrapS=n.wrapT=Re,n.colorSpace=oe,n})(),v=new R({map:_,emissiveMap:_,emissive:3842303,emissiveIntensity:1.6,roughness:.35,metalness:.1}),y=Ia(`woodDark`),b=new R({color:15909166,roughness:.5});for(let t of e.ramps){let n=t.s,i=t.s+t.len,a=e=>t.h*e**1.35,o=za(e,n,i,.5,(e,n,r)=>[[t.d0,a(r)+.02],[t.d1,a(r)+.02]],{vScale:t.type===`glide`?3:2}),s=o.attributes.uv;for(let e=0;e<s.count;e++)s.setX(e,e%2*(t.d1-t.d0)/3);let c=ut([za(e,n,i,.5,(e,n,r)=>[[t.d0,-.3],[t.d0,a(r)+.02]],{vScale:2}),za(e,n,i,.5,(e,n,r)=>[[t.d1,a(r)+.02],[t.d1,-.3]],{vScale:2}),Ba(e,i,t.d0,t.d1,-.3,t.h+.02)]),l=za(e,i-.35,i,.35,()=>[[t.d0,t.h+.03],[t.d1,t.h+.03]],{vScale:1}),u=new U(o,t.type===`glide`?v:g),d=new U(c,y),f=new U(l,t.type===`glide`?Ia(`gold`):b);for(let e of[u,d,f])e.castShadow=!0,e.receiveShadow=!0,r.add(e)}let x=Ea(),S=new R({map:x,emissiveMap:x,emissive:16777215,emissiveIntensity:1.4,roughness:.4,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),C=[];for(let t of e.boosts){let n=za(e,t.s,t.s+t.len,.5,()=>[[t.d-t.halfW,.03],[t.d+t.halfW,.03]],{vScale:t.len/2}),r=n.attributes.uv;for(let e=0;e<r.count;e++)r.setX(e,e%2);C.push(n)}if(C.length){let e=new U(ut(C),S);e.receiveShadow=!0,r.add(e)}let w=Da(),T=new R({map:w,roughness:.6,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),E=za(e,-1,1,1,e=>[[-e.width,.02],[e.width,.02]],{vScale:2});{let e=E.attributes.uv;for(let t=0;t<e.count;t++)e.setXY(t,t%2*1,Math.floor(t/2)/2)}let D=new U(E,T);D.receiveShadow=!0,r.add(D);for(let t of e.bridges){let i=Ia(t.style===`red`?`vermilion`:t.style===`wood`?`woodAged`:`concrete`),a=Ia(t.style===`red`||t.style===`wood`?`woodDark`:`stonePlain`),o=t.s0-2,s=t.s1+2,c=za(e,o,s,1,e=>[[e.width+.6,0],[e.width+.6,-1.1],[-e.width-.6,-1.1],[-e.width-.6,0]],{vScale:4}),l=new U(c,a);if(l.castShadow=!0,l.receiveShadow=!0,r.add(l),t.rail){let t=e=>t=>{let n=t.width;return e<0?[[-n-.6,0],[-n-.6,1],[-n-.1,1],[-n-.1,0]]:[[n+.1,0],[n+.1,1],[n+.6,1],[n+.6,0]]},n=ut([za(e,o,s,1,t(-1),{vScale:3}),za(e,o,s,1,t(1),{vScale:3})]),a=new U(n,i);a.castShadow=!0,a.receiveShadow=!0,r.add(a)}if(n){let i=s-o;i<0&&(i+=e.length);let a=[];for(let t=6;t<i-4;t+=12){let r=e.frameAt(o+t);for(let e of[-1,1]){let t=r.pos.clone().addScaledVector(r.right,e*(r.width-1.5)),i=n.natural(t.x,t.z),o=t.y-1,s=o-i+3;if(s<.5)continue;let c=new Qe(1.4,s,1.4);c.translate(t.x,o-s/2,t.z),a.push(c)}}if(a.length){let e=new U(ut(a),Ia(t.style===`red`?`vermilion`:`concrete`));e.castShadow=!0,e.receiveShadow=!0,r.add(e)}}}return{group:r,update(e){x.offset.y-=e*1.6,_.offset.y-=e*.8}}}var Ua=.5*(Math.sqrt(3)-1),Wa=(3-Math.sqrt(3))/6;function Ga(e=1){let t=new Uint8Array(512),n=new Uint8Array(256);for(let e=0;e<256;e++)n[e]=e;let r=e>>>0||1,i=()=>(r^=r<<13,r>>>=0,r^=r>>>17,r^=r<<5,r>>>=0,r/4294967296);for(let e=255;e>0;e--){let t=Math.floor(i()*(e+1)),r=n[e];n[e]=n[t],n[t]=r}for(let e=0;e<512;e++)t[e]=n[e&255];let a=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];return function(e,n){let r=(e+n)*Ua,i=Math.floor(e+r),o=Math.floor(n+r),s=(i+o)*Wa,c=e-(i-s),l=n-(o-s),u=+(c>l),d=c>l?0:1,f=c-u+Wa,p=l-d+Wa,m=c-1+2*Wa,h=l-1+2*Wa,g=i&255,_=o&255,v=0,y=.5-c*c-l*l;if(y>0){let e=a[t[g+t[_]]&7];y*=y,v+=y*y*(e[0]*c+e[1]*l)}let b=.5-f*f-p*p;if(b>0){let e=a[t[g+u+t[_+d]]&7];b*=b,v+=b*b*(e[0]*f+e[1]*p)}let x=.5-m*m-h*h;if(x>0){let e=a[t[g+1+t[_+1]]&7];x*=x,v+=x*x*(e[0]*m+e[1]*h)}return 70*v}}function Ka(e,t,n,r=4,i=2,a=.5){let o=1,s=1,c=0,l=0;for(let u=0;u<r;u++)c+=o*e(t*s,n*s),l+=o,o*=a,s*=i;return c/l}function K(e,t,n){let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)}function q(e,t,n){return e+(t-e)*n}function qa(e,t,n){return e<t?t:e>n?n:e}var Ja=class{constructor(e,t){this.track=e,this.o=t,this.natural=t.natural,this.shoulder=t.shoulder??2.5,this.blend=t.blend??18,this.roadDrop=t.roadDrop??.05,this.waterLevelAt=t.waterLevelAt||(()=>-1/0),this.surfaceAt=t.surfaceAt||(()=>`grass`),this.colorAt=t.colorAt||null,this._proj=_a.newProj(),this._buildInfluence()}_buildInfluence(){let e=this.track,t=0;for(let n=0;n<e.count;n++)t=Math.max(t,e.w[n]);let n=t+this.shoulder+this.blend+8,r=e.bounds;this._icell=4,this._iminX=r.min.x-n-4,this._iminZ=r.min.z-n-4,this._inx=Math.ceil((r.max.x-r.min.x+2*n)/4)+3,this._inz=Math.ceil((r.max.z-r.min.z+2*n)/4)+3;let i=this._inx*this._inz,a=new Float32Array(i).fill(1/0),o=new Int32Array(i).fill(-1);for(let t=0;t<e.count;t++){let n=e.px[t],r=e.pz[t],i=e.w[t]+this.shoulder+this.blend+8,s=Math.max(0,Math.floor((n-i-this._iminX)/4)),c=Math.min(this._inx-1,Math.floor((n+i-this._iminX)/4)),l=Math.max(0,Math.floor((r-i-this._iminZ)/4)),u=Math.min(this._inz-1,Math.floor((r+i-this._iminZ)/4));for(let e=l;e<=u;e++){let l=this._iminZ+(e+.5)*4;for(let u=s;u<=c;u++){let s=this._iminX+(u+.5)*4,c=(s-n)*(s-n)+(l-r)*(l-r),d=e*this._inx+u;c<i*i&&c<a[d]&&(a[d]=c,o[d]=t)}}}this._iidx=o}_hint(e,t){let n=Math.floor((e-this._iminX)/this._icell),r=Math.floor((t-this._iminZ)/this._icell);return n<0||r<0||n>=this._inx||r>=this._inz?-1:this._iidx[r*this._inx+n]}sample(e,t,n={}){let r=this.natural(e,t);n.natural=r,n.edge=1/0,n.follow=!1,n.s=-1,n.d=0;let i=this._hint(e,t);if(i<0)return n.h=r,n;let a=this.track,o=a.project(e,a.py[i],t,i,this._proj);if(n.s=o.s,n.d=o.d,a.flags[o.index]&_a.FLAGS.NO_TERRAIN_FOLLOW)return n.h=r,n.edge=Math.abs(o.d)-o.width,n;let s=o.width,c=Math.abs(o.d)-s;n.edge=c,n.follow=!0;let l=o.frame,u=Math.hypot(l.right.x,l.right.z)||1,d=qa(o.d,-s,s),f=l.pos.y+l.right.y/u*d;return n.h=c<=0?f-.12:c<this.shoulder?f-this.roadDrop:q(f-this.roadDrop,r,K(0,this.blend,c-this.shoulder)),n}heightAt(e,t){return this.sample(e,t,Ya).h}normalAt(e,t,n=new I){let r=.6,i=this.heightAt(e-r,t),a=this.heightAt(e+r,t),o=this.heightAt(e,t-r),s=this.heightAt(e,t+r);return n.set(i-a,2*r,o-s).normalize(),n}buildMesh({res:e=2,margin:t=90,outer:n=1800,growth:r=1.13}={}){let i=this.track.bounds,a=(i,a)=>{let o=[],s=Math.floor((i-t)/e)*e,c=Math.ceil((a+t)/e)*e;for(let t=s;t<=c+1e-6;t+=e)o.push(t);let l=e,u=s,d=[];for(;u>i-n;)l*=r,u-=l,d.push(u);l=e,u=c;let f=[];for(;u<a+n;)l*=r,u+=l,f.push(u);return[...d.reverse(),...o,...f]},o=a(i.min.x,i.max.x),s=a(i.min.z,i.max.z),c=o.length,l=s.length,u=new Float32Array(c*l*3),d=new Float32Array(c*l*3),f=new Float32Array(c*l*2),p={};for(let e=0;e<l;e++)for(let t=0;t<c;t++){let n=e*c+t,r=o[t],i=s[e];this.sample(r,i,p),u[n*3]=r,u[n*3+1]=p.h,u[n*3+2]=i,f[n*2]=r/5,f[n*2+1]=i/5}let m=new Uint32Array((c-1)*(l-1)*6),h=0;for(let e=0;e<l-1;e++)for(let t=0;t<c-1;t++){let n=e*c+t,r=n+1,i=n+c,a=i+1;t+e&1?(m[h++]=n,m[h++]=i,m[h++]=r,m[h++]=r,m[h++]=i,m[h++]=a):(m[h++]=n,m[h++]=i,m[h++]=a,m[h++]=n,m[h++]=a,m[h++]=r)}let g=new we;g.setAttribute(`position`,new st(u,3)),g.setAttribute(`uv`,new st(f,2)),g.setIndex(new st(m,1)),g.computeVertexNormals();let _=g.attributes.normal;for(let e=0;e<l;e++)for(let t=0;t<c;t++){let n=e*c+t,r=o[t],i=s[e];this.sample(r,i,p);let a=1-_.getY(n),l=this.colorAt?this.colorAt(r,i,p.h,p.edge,a,p):[.3,.45,.2];d[n*3]=l[0],d[n*3+1]=l[1],d[n*3+2]=l[2]}g.setAttribute(`color`,new st(d,3)),g.computeBoundingSphere();let v=Ma(`terrainDetail`,512,512,(e,t,n)=>{e.fillStyle=`#b8b8b8`,e.fillRect(0,0,t,n);let r=7,i=()=>(r=r*16807%2147483647)/2147483647;for(let r=0;r<9e3;r++){let r=i()*t,a=i()*n,o=150+i()*105;e.strokeStyle=`rgba(${o},${o},${o},${.25+i()*.35})`,e.lineWidth=1+i()*1.5,e.beginPath(),e.moveTo(r,a),e.lineTo(r+(i()-.5)*4,a-3-i()*7),e.stroke()}for(let r=0;r<1500;r++)e.fillStyle=`rgba(60,60,60,${i()*.18})`,e.fillRect(i()*t,i()*n,2+i()*4,2+i()*4)}),y=new R({vertexColors:!0,map:v,roughness:.95,metalness:0,polygonOffset:!0,polygonOffsetFactor:1,polygonOffsetUnits:2});y.name=`terrain`;let b=new U(g,y);return b.receiveShadow=!0,b.castShadow=!1,b.name=`terrain`,b.matrixAutoUpdate=!1,this.mesh=b,b}},Ya={},Xa=new xe,Za=new xe,Qa=new I,$a=new I,eo=new I,to=[new I,new I,new I,new I],no=[new I,new I,new I,new I],ro=[new I,new I,new I,new I,new I,new I,new I,new I],io=2,ao=.1,oo=class extends he{constructor(){super(new gt(-5,5,5,-5,.5,500)),this.isSunLightShadow=!0,this.mapSize.set(1024,1024),this._cameras=[],this._matrices=[],this._frustums=[],this._cascadeSplits=[,,,].fill(0),this._cascadeData=[],this._viewportCount=io,this._frameExtents.set(2,1);for(let e=0;e<io;e++)this._cameras.push(new gt),this._matrices.push(new xe),this._frustums.push(new w),this._cascadeData.push(new re);for(;this._viewports.length<io;)this._viewports.push(new re)}getCamera(e=0){return this._cameras[e]}getMatrix(e=0){return this._matrices[e]}getFrustum(e=0){return this._frustums[e]}updateMatrices(e,t){if(t===void 0)return;let n=Math.min(.25,(Math.ceil(this.radius)+1)/this.mapSize.x),r=Math.min(.25,(Math.ceil(this.radius)+1)/this.mapSize.y);for(let e=0;e<io;e++)this._viewports[e].set(e+n,r,1-2*n,1-2*r);let i=this.mapSize.x*(1-2*n),a=this.mapSize.y*(1-2*r),o=Math.min(i,a),s=this.camera,c=t.near,l=Math.max(c+1e-6,Math.min(s.far,t.far)),u=this._cascadeSplits;u[0]=c;for(let e=1;e<io;e++){let t=e/io,n=c+(l-c)*t,r=c>0?c*(l/c)**+t:n;u[e]=(n+r)*.5}u[io]=l,Qa.setFromMatrixPosition(e.matrixWorld).negate().normalize(),$a.set(0,1,0),Math.abs($a.dot(Qa))>.99&&$a.set(0,0,1),Xa.lookAt(eo.set(0,0,0),Qa,$a),Za.copy(Xa).transpose().multiply(t.matrixWorld);let d=t.reversedDepth?1:t.coordinateSystem===2001?0:-1,f=t.projectionMatrixInverse,p=-1/0;for(let e=0;e<4;e++){let n=e===0||e===1?1:-1,r=e===0||e===3?1:-1,i=to[e].set(n,r,d).applyMatrix4(f),a=no[e];t.isPerspectiveCamera===!0?a.copy(i).multiplyScalar(l/c):a.set(i.x,i.y,-l),i.applyMatrix4(Za),a.applyMatrix4(Za),p=Math.max(p,i.z,a.z)}p+=l;let m=s.near;for(let e=0;e<io;e++){let t=e===0?u[0]:this._cascadeData[e-1].z,n=u[e+1],r=n-ao*(n-u[e]);this._cascadeData[e].set(e===0?-1e10:t,n,r,0);let d=(t-c)/(l-c),f=(n-c)/(l-c);eo.set(0,0,0);for(let e=0;e<4;e++)ro[e*2].lerpVectors(to[e],no[e],d),ro[e*2+1].lerpVectors(to[e],no[e],f),eo.add(ro[e*2]).add(ro[e*2+1]);eo.multiplyScalar(1/8);let h=0,g=1/0;for(let e=0;e<8;e++)h=Math.max(h,ro[e].distanceToSquared(eo)),g=Math.min(g,ro[e].z);let _=Math.sqrt(h);if(o>1){_/=1-1/o;let e=2*_/i,t=2*_/a;eo.x=Math.round(eo.x/e)*e,eo.y=Math.round(eo.y/t)*t}eo.z=p+m,eo.applyMatrix4(Xa);let v=this._cameras[e];v.position.copy(eo),v.quaternion.setFromRotationMatrix(Xa),v.left=-_,v.right=_,v.top=_,v.bottom=-_,v.near=m,v.far=p-g+2*m,v.coordinateSystem=s.coordinateSystem,v._reversedDepth=s.reversedDepth,v.updateProjectionMatrix(),v.updateMatrixWorld(),this._updateMatrix(v,this._matrices[e],this._frustums[e],this._viewports[e])}}},so=class extends ge{constructor(e,t){super(e,t),this.isSunLight=!0,this.type=`SunLight`,this.position.copy(ve.DEFAULT_UP),this.updateMatrix(),this.shadow=new oo}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t}},co=`
varying vec3 vDir;
void main() {
  vDir = (modelMatrix * vec4(position, 0.0)).xyz;
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}
`,lo=`
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uGround;
uniform vec3 uHaze;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunSize;
uniform float uSunGlow;
uniform float uSunDisk;
uniform float uTime;
uniform float uCloudCover;
uniform float uCloudSoft;
uniform float uCloudOpacity;
uniform vec3 uCloudLit;
uniform vec3 uCloudShade;
uniform float uStars;
uniform vec3 uMoonDir;
uniform float uMoon;
uniform float uGradExp;
varying vec3 vDir;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i), b = hash21(i + vec2(1.0, 0.0)), c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = m * p; a *= 0.5; }
  return s;
}

void main() {
  vec3 d = normalize(vDir + vec3(0.0, 1e-5, 0.0));
  float y = d.y;
  float h = max(y, 0.0);
  vec3 col = mix(uHorizon, uZenith, pow(h, uGradExp));
  // warm haze band hugging the horizon, stronger toward the sun
  float cosA = dot(d, uSunDir);
  float sunSide = pow(max(cosA * 0.5 + 0.5, 0.0), 3.0);
  col = mix(col, uHaze, exp(-h * 9.0) * (0.35 + 0.65 * sunSide));
  if (y < 0.0) col = mix(mix(uHorizon, uHaze, 0.5), uGround, 1.0 - exp(y * 10.0));

  // sun glow
  float g1 = pow(max(cosA, 0.0), 6.0);
  float g2 = pow(max(cosA, 0.0), 60.0);
  float g3 = pow(max(cosA, 0.0), 800.0);
  col += uSunColor * (g1 * 0.25 + g2 * 0.6 + g3 * 1.5) * uSunGlow;

  // cloud layer (projected plane)
  float cloud = 0.0;
  if (y > 0.0) {
    vec2 uv = d.xz / (y + 0.08) * 0.9 + uTime * vec2(0.006, 0.0025);
    float n = fbm(uv * 1.3);
    float n2 = fbm(uv * 1.3 + uSunDir.xz * 0.12);
    cloud = smoothstep(uCloudCover, uCloudCover + uCloudSoft, n) * smoothstep(0.0, 0.18, y) * uCloudOpacity;
    float lit = clamp(0.55 + (n - n2) * 5.0, 0.0, 1.0);
    vec3 cc = mix(uCloudShade, uCloudLit, lit);
    cc += uSunColor * (g1 * 0.9 + g2 * 1.6) * 0.8; // silver lining toward the sun
    col = mix(col, cc, cloud);
  }

  // sun disk (hidden by clouds)
  float disk = smoothstep(1.0 - uSunSize, 1.0 - uSunSize * 0.5, cosA);
  col += uSunColor * disk * uSunDisk * (1.0 - cloud * 0.85);

  // stars
  if (uStars > 0.0 && y > 0.0) {
    vec3 sd = d * 300.0;
    vec2 cell = floor(sd.xz / (sd.y * 0.02 + 1.0) * 0.6 + sd.y * 0.7);
    vec2 p2 = floor(d.xz * 420.0 / (y + 0.35));
    float st = hash21(p2);
    float tw = 0.6 + 0.4 * sin(uTime * 3.0 + st * 60.0);
    float star = step(0.9965, st) * tw * smoothstep(0.02, 0.3, y);
    col += vec3(0.9, 0.95, 1.0) * star * uStars * 3.0 * (1.0 - cloud);
    // milky haze band
    float band = exp(-pow(dot(d, normalize(vec3(0.3, 0.2, 1.0))) * 3.0, 2.0));
    col += vec3(0.25, 0.3, 0.5) * band * fbm(d.xz * 6.0) * 0.15 * uStars * (1.0 - cloud);
  }
  // moon
  if (uMoon > 0.0) {
    float cm = dot(d, uMoonDir);
    float md = smoothstep(0.99955, 0.99975, cm);
    float crater = fbm(d.xy * 400.0) * 0.25;
    col += vec3(1.0, 0.97, 0.88) * md * (2.2 - crater) * uMoon;
    col += vec3(0.5, 0.6, 0.9) * pow(max(cm, 0.0), 300.0) * 0.5 * uMoon;
    col += vec3(0.3, 0.4, 0.7) * pow(max(cm, 0.0), 20.0) * 0.08 * uMoon;
  }
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;function uo(e){let t=document.createElement(`canvas`);t.width=512,t.height=256;let n=t.getContext(`2d`),r=e,i=()=>(r=r*16807%2147483647)/2147483647;n.clearRect(0,0,512,256);let a=[];for(let e=0;e<22;e++){let t=e/21,n=70+t*372+(i()-.5)*30,r=Math.sin(t*Math.PI),o=200-r*(70+i()*70)-i()*20,s=30+r*45+i()*25;a.push([n,o,s])}for(let e=0;e<10;e++)a.push([60+i()*392,190+i()*20,30+i()*25]);for(let[e,t,r]of a){let i=n.createRadialGradient(e,t,r*.2,e,t,r);i.addColorStop(0,`rgba(90,90,90,1)`),i.addColorStop(.7,`rgba(110,110,110,0.9)`),i.addColorStop(1,`rgba(120,120,120,0)`),n.fillStyle=i,n.beginPath(),n.arc(e,t,r,0,Math.PI*2),n.fill()}for(let[e,t,r]of a){let i=e-r*.25,a=t-r*.35,o=n.createRadialGradient(i,a,r*.05,i,a,r*.85);o.addColorStop(0,`rgba(255,255,255,0.95)`),o.addColorStop(.5,`rgba(225,225,225,0.55)`),o.addColorStop(1,`rgba(200,200,200,0)`),n.fillStyle=o,n.beginPath(),n.arc(i,a,r*.85,0,Math.PI*2),n.fill()}let o=n.createLinearGradient(0,180,0,236);o.addColorStop(0,`rgba(0,0,0,0)`),o.addColorStop(1,`rgba(0,0,0,1)`),n.globalCompositeOperation=`destination-out`,n.fillStyle=o,n.fillRect(0,180,512,76),n.globalCompositeOperation=`source-over`;let s=new ft(t);return s.colorSpace=``,s}var fo=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,po=`
uniform sampler2D map;
uniform vec3 uLit;
uniform vec3 uShade;
uniform vec3 uRim;
uniform float uRimAmt;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  vec4 t = texture2D(map, vUv);
  float a = t.a * uOpacity;
  if (a < 0.01) discard;
  float lit = clamp((t.r - 0.35) * 1.6 + (vUv.y - 0.5) * 0.5, 0.0, 1.0);
  vec3 col = mix(uShade, uLit, lit);
  // rim light at the thin edges
  col += uRim * uRimAmt * (1.0 - smoothstep(0.0, 0.6, t.a));
  gl_FragColor = vec4(col, a);
}
`,mo=class{constructor(e){this.p=e;let t=e=>new B(e);this.uniforms={uZenith:{value:t(e.zenith)},uHorizon:{value:t(e.horizon)},uHaze:{value:t(e.haze??e.horizon)},uGround:{value:t(e.ground??4210752)},uSunDir:{value:new I(...e.sunDir||[.3,.3,-1]).normalize()},uSunColor:{value:t(e.sunColor??16769200)},uSunSize:{value:e.sunSize??6e-4},uSunGlow:{value:e.sunGlow??1},uSunDisk:{value:e.sunDisk??30},uTime:{value:0},uCloudCover:{value:e.cloudCover??.55},uCloudSoft:{value:e.cloudSoft??.25},uCloudOpacity:{value:e.cloudOpacity??.9},uCloudLit:{value:t(e.cloudLit??16777215)},uCloudShade:{value:t(e.cloudShade??10135224)},uStars:{value:e.stars??0},uMoonDir:{value:new I(...e.moonDir||[.3,.5,-1]).normalize()},uMoon:{value:e.moon??0},uGradExp:{value:e.gradExp??.55}};let n=new P({uniforms:this.uniforms,vertexShader:co,fragmentShader:lo,side:1,depthWrite:!1,fog:!1});this.dome=new U(new r(1e3,64,32),n),this.dome.name=`skydome`,this.dome.frustumCulled=!1,this.dome.renderOrder=-1e3,this.group=new W,this.group.name=`sky`,this.group.add(this.dome),this.clouds=[];let i=e.billboards;if(i&&i.count>0){let n=[uo(11),uo(29),uo(53),uo(97)],r=this.uniforms.uSunDir.value;for(let a=0;a<i.count;a++){let o=n[a%n.length],s=new P({uniforms:{map:{value:o},uLit:{value:t(i.lit??16777215)},uShade:{value:t(i.shade??9411504)},uRim:{value:t(e.sunColor??16769200)},uRimAmt:{value:0},uOpacity:{value:i.opacity??.95}},vertexShader:fo,fragmentShader:po,transparent:!0,depthWrite:!1,fog:!1}),c=a/i.count*Math.PI*2+Math.sin(a*12.9898)*.5,l=(i.dist??2200)*(.85+a*37%10/30),u=(i.minW??500)+a*53%10/10*((i.maxW??1100)-(i.minW??500)),d=new U(new se(u,u*.5),s),f=(i.minH??60)+a*71%10/10*((i.maxH??260)-(i.minH??60));d.position.set(Math.sin(c)*l,f+u*.2,Math.cos(c)*l),d.lookAt(0,d.position.y,0),d.renderOrder=-900,d.frustumCulled=!1;let p=new I(d.position.x,0,d.position.z).normalize(),m=new I(r.x,0,r.z).normalize();s.uniforms.uRimAmt.value=Math.max(0,p.dot(m))*(i.rimAmt??1.2),this.group.add(d),this.clouds.push(d)}}}get sunDir(){return this.uniforms.uSunDir.value}update(e,t){this.uniforms.uTime.value+=e,this.group.position.copy(t.position),this.group.position.y=t.position.y*.3}buildEnvironment(e){let t=new Zt(e),n=new vt,r=this.dome.clone();r.material=this.dome.material.clone(),r.material.uniforms=fe.clone(this.uniforms),r.material.uniforms.uSunDisk.value=Math.min(this.uniforms.uSunDisk.value,4),n.add(r);for(let e of this.clouds)n.add(e.clone());let i=t.fromScene(n,0,.1,5e3);return t.dispose(),r.material.dispose(),i.texture}};function ho(e,t,n){let r=new mo(n.sky);e.add(r.group);let i=r.sunDir.clone(),a=new so(new B(n.sun.color),n.sun.intensity);a.position.copy(i),a.castShadow=n.sun.shadows!==!1,a.shadow.mapSize.set(2048,2048),a.shadow.camera.far=n.sun.shadowFar??220,a.shadow.camera.near=.5,a.shadow.bias=n.sun.bias??-25e-5,a.shadow.normalBias=n.sun.normalBias??.035,a.shadow.radius=2,a.shadow.intensity=n.sun.shadowIntensity??1,e.add(a);let o=new de(new B(n.hemi.sky),new B(n.hemi.ground),n.hemi.intensity);e.add(o),e.fog=new y(new B(n.fog.color),n.fog.density),la.sunDirWorld.copy(i),la.setSunColor(new B(n.fog.sunColor??n.fog.color));let s=r.buildEnvironment(t);return e.environment=s,e.environmentIntensity=n.envIntensity??1,e.background=null,{sky:r,sun:a,hemi:o,envTex:s,update(e,t){r.update(e,t)},dispose(){s.dispose()}}}var go=class{constructor(e,t,n={}){this.def=t,this.stage=t,this.renderer=e,this.quality=n.quality||`high`;let r=new vt;this.scene=r,this.track=new _a(t.track),this.terrain=new Ja(this.track,t.terrain),this.ground=new ya(this.track,this.terrain,t),this.env=ho(r,e.renderer,t.env),this.updaters=[];let i=this.terrain.buildMesh(t.terrainMesh||{});r.add(i);let a=Ha(this.track,t.trackStyle||{},this.terrain);r.add(a.group),this.trackMeshes=a,this.updaters.push(e=>a.update(e))}async decorate(e){if(this.def.build){let t=await this.def.build({...e,world:this,scene:this.scene,track:this.track,terrain:this.terrain,renderer:this.renderer});t&&t.update&&this.updaters.push(t.update),this.stageRuntime=t||{}}}update(e,t,n){for(let r of this.updaters)r(e,t,n)}},_o={"50cc":{maxSpeed:23,accel:13,ai:.9},"100cc":{maxSpeed:27,accel:15,ai:.96},"150cc":{maxSpeed:31.5,accel:17,ai:1}},vo=30,yo={road:1,dirt:.82,sand:.7,grass:.62,paddy:.52,water:.5,shallow:.5},bo=new I,xo=new I,So=new I,Co=new I;new p;var wo=new xe,To=class{constructor(e,t){this.world=e,this.track=e.track,this.id=t.id,this.character=t.character,this.name=t.name||t.character,this.isPlayer=!!t.isPlayer,this.color=t.color||`#ffffff`;let n=_o[t.difficulty||`100cc`],r=t.stats||{speed:3,accel:3,handling:3,weight:3};this.stats=r,this.baseMax=n.maxSpeed*(.965+.0175*r.speed),this.accelRate=n.accel*(.84+.08*r.accel),this.turnMul=.9+.05*r.handling,this.weight=.8+.1*r.weight,this.radius=.95,this.pos=new I,this.vel=new I,this.heading=0,this.up=new I(0,1,0),this.groundN=new I(0,1,0),this.grounded=!0,this.airTime=0,this.speed=0,this.steerSmooth=0,this.throttle=0,this.surface=`road`,this.onRoad=!0,this.drift={active:!1,dir:0,charge:0,level:0,pendingHop:!1,hopT:0},this.hopQueued=!1,this.boostT=0,this.boostPower=0,this.boostKind=``,this.glide={active:!1,open:0,t:0},this.trick={t:-1,type:`flip`,window:0,done:!1},this.spin={t:-1,dur:1.1,kind:`spin`},this.squash=0,this.invincibleT=0,this.safeT=0,this.starT=0,this.shrinkT=0,this.rampLaunch=null,this.lastRamp=null,this.onRampPrev=null,this.respawnT=-1,this.respawnS=0,this.lastSafeS=0,this.lastSafeD=0,this.proj=_a.newProj(),this.trackIndex=-1,this.s=0,this.lapCount=0,this.raceDist=0,this.finished=!1,this.finishTime=null,this.lapTimes=[],this.lapStart=0,this.wrongWayT=0,this.coins=0,this.item=null,this.itemCount=0,this.itemRoulette=0,this.position=1,this.events=[],this.visualYaw=0,this.driftVisual=0,this.frozen=!0,this.wallCooldown=0,this._hopLandT=-10,this._time=0,this._jumpHeld=!1}emit(e,t={}){this.events.push({type:e,...t})}place(e,t,n=null){let r=this.track,i=r.frameAt(e);this.pos.copy(i.pos).addScaledVector(i.right,t);let a=this.world.ground.query(this.pos.x,this.pos.y+2,this.pos.z,r.idx(e),Do);this.pos.y=a.y,this.heading=n??Math.atan2(i.tan.x,i.tan.z),this.vel.set(0,0,0),this.speed=0,this.grounded=!0,this.trackIndex=r.idx(e),this.s=r.wrapS(e),this.lastSafeS=this.s,this.lastSafeD=t,this.groundN.copy(a.normal),this.up.copy(a.normal)}get maxSpeed(){return this.baseMax*(1+.006*this.coins)*(this.rubberMul??1)}forward(e=new I){return e.set(Math.sin(this.heading),0,Math.cos(this.heading))}addBoost(e,t,n=`boost`){this.boostT=Math.max(this.boostT,e),this.boostPower=Math.max(this.boostT>0?this.boostPower:0,t),this.boostKind=n,this.emit(`boost`,{kind:n,power:t})}hit(e=`spin`,{ignoreSafe:t=!1}={}){return this.invincibleT>0||this.safeT>0&&!t||this.respawnT>=0?!1:(this.spin.t=0,this.spin.kind=e,this.spin.dur=e===`tumble`?1.6:e===`squash`?1:1.15,this.drift.active=!1,this.drift.level=0,this.boostT=0,this.glide.active=!1,e===`tumble`&&(this.vel.y=Math.max(this.vel.y,7)),this.safeT=this.spin.dur+1.2,this.emit(`hit`,{kind:e}),!0)}startRespawn(e=`fall`){if(this.respawnT>=0)return;this.respawnT=0;let t=this.track.inGap(this.s);this.respawnS=t?t.respawn:this.lastSafeS,this.respawnD=t?0:Math.max(-this.track.w[this.track.idx(this.respawnS)]+2,Math.min(this.track.w[this.track.idx(this.respawnS)]-2,this.lastSafeD)),this.glide.active=!1,this.drift.active=!1,this.boostT=0,this.emit(`respawn_start`,{reason:e})}step(e,t,n){let r=this.track;if(this._time=n,this.wallCooldown=Math.max(0,this.wallCooldown-e),this.safeT=Math.max(0,this.safeT-e),this.invincibleT=Math.max(0,this.invincibleT-e),this.squash=Math.max(0,this.squash-e*3.5),this.respawnT>=0){if(this.respawnT+=e,this.respawnT>=.9&&!this._respawnPlaced&&(this._respawnPlaced=!0,this.place(this.respawnS,this.respawnD),this.pos.y+=3,this.grounded=!1,this.emit(`respawn_place`)),this.respawnT>=.9){this.vel.set(0,-4,0),this.pos.y+=this.vel.y*e;let t=this.world.ground.query(this.pos.x,this.pos.y,this.pos.z,this.trackIndex,Do);this.pos.y<=t.y&&(this.pos.y=t.y,this.respawnT=-1,this._respawnPlaced=!1,this.grounded=!0,this.safeT=1.5,this.emit(`respawn_done`))}this._updateProgress(n,e);return}let i=this.frozen,a=i?0:t.steer,o=i?0:t.accel,s=i?0:t.brake,c=!i&&t.jump,l=!i&&t.jumpPressed;if(this._jumpHeld=c,this.spin.t>=0){this.spin.t+=e;let t=this.spin.t/this.spin.dur;this.visualYaw=this.spin.kind===`squash`?0:-Math.PI*4*Eo(Math.min(1,t)),a=0,o=0,s=0,c=!1,l=!1,t>=1&&(this.spin.t=-1,this.visualYaw=0)}let u=Math.abs(a)>Math.abs(this.steerSmooth)?7:10;this.steerSmooth+=(a-this.steerSmooth)*Math.min(1,u*e),a=this.steerSmooth,this.throttle=o;let d=this.world.ground.query(this.pos.x,this.pos.y,this.pos.z,this.trackIndex,Do);this.trackIndex=d.proj.index,this.boostT>0&&(this.boostT-=e,this.boostT<=0&&(this.boostT=0,this.boostPower=0));let f=this.boostT>0||this.invincibleT>0,p=this.boostT>0?this.boostPower:0,m=this.invincibleT>0?5:0,h=this.forward(bo);if(this.grounded){let t=So.copy(d.normal);h.addScaledVector(t,-h.dot(t)),h.lengthSq()<1e-6&&h.set(Math.sin(this.heading),0,Math.cos(this.heading)),h.normalize();let i=xo.crossVectors(h,t).normalize(),u=this.vel.dot(h),g=this.vel.dot(i);this.surface=d.surface,this.onRoad=d.surface===`road`;let _=yo[d.surface]??.6;f&&(_=Math.max(_,.95));let v=this.maxSpeed*_+p+m;if(o>.05&&u>-.5&&u<v){let t=Math.max(0,u/Math.max(1,v));u+=this.accelRate*o*Math.max(.12,1-t**1.9)*e,f&&(u+=18*e),u=Math.min(u,v+.01)}if(u>v&&(u-=Math.min(u-v,(u-v)*1.3*e+4*e)),s>.05&&(u>.8?u-=26*s*e:u=Math.max(-9,u-9*s*e)),o<=.05&&s<=.05){let t=(this.onRoad?4.5:9)*e;u=Math.abs(u)<t?0:u-Math.sign(u)*t}o>.05&&u<-.5&&(u+=20*e),u-=vo*h.y*.55*e;let y=l&&this.spin.t<0;if(!this.drift.active&&c&&n-this._hopLandT<.25&&Math.abs(a)>.4&&u>10&&this.spin.t<0&&(this.drift.active=!0,this.drift.dir=Math.sign(a),this.drift.charge=0,this.drift.level=0,this.emit(`drift_start`,{dir:this.drift.dir})),this.drift.active){let t=this.drift;if(!c||u<9||!this.onRoad&&d.surface!==`dirt`&&!f&&u<12)this._releaseDrift();else{let n=Math.max(0,a*t.dir);t.charge+=e*(.75+.9*n);let r=t.charge>3.3?3:t.charge>2.05?2:+(t.charge>.95);r>t.level&&(t.level=r,this.emit(`drift_level`,{level:r}))}}let b=Math.abs(u),x;if(this.drift.active){let e=this.drift,t=a*e.dir;x=e.dir*(1.05+(t>0?t*.85:t*.6))*Math.min(1,b/12)*this.turnMul}else{let e=Math.min(1,b/6),t=2.05-.55*Math.min(1,b/this.maxSpeed);x=a*t*e*this.turnMul,u<-.5&&(x=-x),this.onRoad||(x*=.9)}this.heading-=x*e;let S=this.drift.active?5.5:this.onRoad?14:9;g*=Math.exp(-S*e),this.vel.copy(h).multiplyScalar(u).addScaledVector(i,g),this.speed=u,y&&this._hop(t),r.boostAt(d.proj.s,d.proj.d)&&d.surface===`road`&&this.pos.y-d.roadY<.6?(this._onDash||this.addBoost(1.25,10,`dash`),this._onDash=!0,this.boostT=Math.max(this.boostT,.9)):this._onDash=!1,this.onRampPrev=d.ramp,d.ramp&&(this.lastRamp=d.ramp),this.airTime=0}else{if(this.airTime+=e,this.glide.active)this._glideStep(e,a,o,s);else{this.vel.y-=vo*e;let t=a*.9*e;this.heading-=t;let n=Math.hypot(this.vel.x,this.vel.z);if(n>.1){let t=Math.atan2(this.vel.x,this.vel.z),r=this.heading-t;for(;r>Math.PI;)r-=Math.PI*2;for(;r<-Math.PI;)r+=Math.PI*2;let i=t+r*Math.min(1,1.2*e);this.vel.x=Math.sin(i)*n,this.vel.z=Math.cos(i)*n}this.drift.active&&!c&&this._releaseDrift()}l&&this.trick.window>0&&this.trick.t<0&&this.spin.t<0&&(this.trick.t=0,this.trick.type=[`flip`,`spin`,`roll`][Math.floor(Math.random()*3)],this.trick.done=!1,this.emit(`trick`)),this.speed=this.vel.dot(this.forward(Co))}if(this.trick.window>0&&(this.trick.window-=e),this.trick.t>=0&&(this.trick.t+=e/.5,this.trick.t>=1&&(this.trick.t=-1,this.trick.done=!0)),this.spin.t>=0){let t=this.spin.kind===`squash`?5:2.2;this.vel.x*=Math.exp(-t*e),this.vel.z*=Math.exp(-t*e)}let g=this.pos.y;this.pos.addScaledVector(this.vel,e);let _=this.world.ground.query(this.pos.x,this.pos.y,this.pos.z,this.trackIndex,Do);if(this.trackIndex=_.proj.index,this.grounded){let t=this.pos.y-_.y,n=.25+Math.abs(this.speed)*e*.9,r=this.onRampPrev&&!_.ramp,i=Math.hypot(this.vel.x,this.vel.z),a=!1;if(i>8){let t=this.vel.x/i,n=this.vel.z/i;a=((_.normal.x-this.groundN.x)*t+(_.normal.z-this.groundN.z)*n)/Math.max(.02,i*e)*i*i>vo*1.15}if(!r&&!a&&t<n&&t>-1.5&&!this._hopping){this.pos.y=_.y;let e=this.vel.dot(_.normal);this.vel.addScaledVector(_.normal,-e),this.groundN.copy(_.normal)}else t<-1.5&&_.surface!==`none`?this.pos.y=_.y:this._leaveGround(r?this.onRampPrev:null)}else this.pos.y<=_.y&&this.vel.y<=.5&&this._land(_,g);this._hopping=!1,this._walls();let v=this.grounded?this.groundN:Co.set(0,1,0);if(this.up.lerp(v,Math.min(1,e*(this.grounded?12:3))).normalize(),!this.glide.active){_.surface===`deep`&&this.pos.y<_.waterY+.2&&this.startRespawn(`water`),this.pos.y<(this.world.stage.killY??-30)&&this.startRespawn(`fall`);let e=r.inGap(this.s);e&&this.pos.y<e.killY&&!this.grounded&&this.startRespawn(`fall`)}this.grounded&&_.surface!==`deep`&&Math.abs(_.proj.d)<_.proj.width+3&&!r.inGap(_.proj.s)&&(this.lastSafeS=_.proj.s,this.lastSafeD=_.proj.d),this.grounded&&(_.surface===`water`||_.surface===`paddy`)&&Math.abs(this.speed)>6&&Math.random()<e*30&&this.emit(`splash_fx`);let y=this.drift.active?this.drift.dir:0;this.driftVisual+=(y-this.driftVisual)*Math.min(1,e*8),this._updateProgress(n,e)}_hop(e){this.grounded&&(this.vel.addScaledVector(e,4.2),this.grounded=!1,this._hopping=!0,this.hopLand=!0,this.emit(`hop`))}_leaveGround(e){if(this.grounded=!1,this.airTime=0,e){let t=(e.type,e.launch);this.vel.y=Math.max(this.vel.y,t);let n=Math.hypot(this.vel.x,this.vel.z);if(n<16){let e=16/Math.max(.1,n);this.vel.x*=e,this.vel.z*=e}this.trick.window=.45,e.type===`glide`&&(this.glide.active=!0,this.glide.t=0,this.emit(`glide_start`)),this.emit(`launch`,{ramp:e.type}),this.drift.active&&this._releaseDrift()}else!this.hopLand&&Math.abs(this.speed)>12&&(this.trick.window=.3)}_land(e,t){let n=-this.vel.y;this.pos.y=e.y;let r=this.vel.dot(e.normal);r<0&&this.vel.addScaledVector(e.normal,-r),this.grounded=!0,this.groundN.copy(e.normal);let i=this.glide.active;if(this.glide.active=!1,(this.airTime>.42||n>7)&&(this.squash=Math.min(1,n/14),this.emit(`land`,{impact:n,airTime:this.airTime})),i&&this.emit(`glide_end`),(this.trick.done||this.trick.t>=0)&&(this.trick.t=-1,this.trick.done=!1,this.addBoost(.8,6,`trick`),this.emit(`trick_land`)),this.trick.window=0,this.hopLand){this.hopLand=!1,this._hopLandT=this._time;let e=this.steerSmooth;this._jumpHeld&&Math.abs(e)>.25&&Math.abs(this.speed)>10&&this.spin.t<0&&(this.drift.active=!0,this.drift.dir=Math.sign(e),this.drift.charge=0,this.drift.level=0,this.emit(`drift_start`,{dir:this.drift.dir}))}this.airTime=0}_releaseDrift(){let e=this.drift;if(e.active){if(e.active=!1,e.level>=1){let[t,n]={1:[.65,5.5],2:[1.15,6.5],3:[1.8,7.5]}[e.level];this.addBoost(t,n,`turbo`+e.level)}e.level=0,e.charge=0,this.emit(`drift_end`)}}_glideStep(e,t,n,r){let i=this.glide;i.t+=e,i.open=Math.min(1,i.open+e*3);let a=Math.hypot(this.vel.x,this.vel.z),o=r>.05,s=o?19:25+(this.boostT>0?this.boostPower:0);a+=(s-a)*Math.min(1,e*.8);let c=o?-2.4:-5;i.t<.35?this.vel.y-=vo*.6*e:this.vel.y+=(c-this.vel.y)*Math.min(1,e*2.2),this.heading-=t*1.25*e,this.vel.x=Math.sin(this.heading)*a,this.vel.z=Math.cos(this.heading)*a}_walls(){let e=this.track,t=e.project(this.pos.x,this.pos.y,this.pos.z,this.trackIndex,this.proj);if(this.trackIndex=t.index,this.glide.active&&this.pos.y>t.frame.pos.y+3)return;let n=t.index,r=e.wallL[n],i=e.wallR[n],a=.8,o=0,s=0;t.d>i-a?(o=t.d-(i-a),s=1):t.d<-(r-a)&&(o=-(r-a)-t.d,s=-1);let c=this.world.colliders;if(c&&!(this.glide.active&&this.pos.y>t.frame.pos.y+2)){let e=c.resolve(this.pos,.85);if(e){let t=this.vel.x*e.nx+this.vel.z*e.nz;t<0&&(this.vel.x-=e.nx*t*1.3,this.vel.z-=e.nz*t*1.3,-t>4&&this.wallCooldown<=0&&(this.wallCooldown=.35,this.vel.x*=.85,this.vel.z*=.85,this.emit(`wall`,{impact:-t})))}}if(o>0){let e=t.frame.right,n=Math.hypot(e.x,e.z)||1,r=e.x/n*s,i=e.z/n*s;this.pos.x-=r*o,this.pos.z-=i*o;let a=this.vel.x*r+this.vel.z*i;a>0&&(this.vel.x-=r*a*1.35,this.vel.z-=i*a*1.35,a>4&&this.wallCooldown<=0&&(this.vel.x*=.9,this.vel.z*=.9,this.wallCooldown=.35,this.emit(`wall`,{impact:a})))}}_updateProgress(e,t=1/120){let n=this.track,r=n.project(this.pos.x,this.pos.y,this.pos.z,this.trackIndex,this.proj);this.trackIndex=r.index;let i=this.s,a=r.s,o=n.length;i>o*.75&&a<o*.25?(this.lapCount++,this.emit(`lap`,{lap:this.lapCount})):i<o*.25&&a>o*.75&&this.lapCount--,this.s=a,this.raceDist=(this.lapCount-1)*o+a;let s=this.forward(Co);s.x*r.frame.tan.x+s.z*r.frame.tan.z<-.35&&Math.abs(this.speed)>3&&!this.frozen?this.wrongWayT+=t:this.wrongWayT=Math.max(0,this.wrongWayT-2*t)}setJumpHeld(e){this._jumpHeld=e}renderQuaternion(e=new p){let t=this.heading+this.visualYaw,n=Co.set(Math.sin(t),0,Math.cos(t)),r=this.up;n.addScaledVector(r,-n.dot(r)).normalize();let i=xo.crossVectors(n,r).normalize();return wo.makeBasis(Oo.copy(i).negate(),r,n),e.setFromRotationMatrix(wo),e}};function Eo(e){return 1-(1-e)**2.2}var Do={},Oo=new I,ko=new I,Ao=class{constructor(e,t,{skill:n=.8,seed:r=1}={}){this.kart=e,this.race=t,this.track=e.track,this.skill=n,this.seed=r,this.lineBias=r*37%7/3-1,this.wander=0,this.wanderT=0,this.driftHold=!1,this.itemTimer=1+r*13%5,this.jumpWas=!1,this.c={steer:0,accel:0,brake:0,jump:!1,jumpPressed:!1,itemPressed:!1,lookBack:!1},this.mistakeT=0,this.stuckT=0,this.reverseT=0}lineAt(e){let t=this.track,n=0;for(let r=0;r<6;r++)n+=t.curv[t.idx(e+r*5)];n/=6;let r=t.w[t.idx(e)],i=ot.clamp(n*190,-1,1)*r*.55;return i+=this.lineBias*r*.28+this.wander,ot.clamp(i,-r+1.6,r-1.6)}update(e,t){let n=this.kart,r=this.track,i=this.c;if(i.jumpPressed=!1,i.itemPressed=!1,i.lookBack=!1,n.frozen||n.finished&&n.finishTime!=null&&t-n.finishTime>6)return i.accel=n.finished?.5:0,i.steer=0,!n.frozen&&n.finished&&this._steerAlong(e,.6),i;this.wanderT-=e,this.wanderT<=0&&(this.wanderT=1.5+Math.random()*2.5,this.wanderTarget=(Math.random()-.5)*3.5*(1.2-this.skill)),this.wander+=((this.wanderTarget||0)-this.wander)*Math.min(1,e*.8);let a=Math.max(0,n.speed),o=0;for(let e=1;e<=5;e++)o=Math.max(o,Math.abs(r.curv[r.idx(n.s+e*4)]));let s=(7+a*.5)/(1+o*45),c=n.s+s,l=this.lineAt(c);if(!n.item&&!n.itemRoulette){let e=this.race.items&&this.race.items.nearestBoxAhead(n,45);e&&(l=ot.lerp(l,e.d,.7))}if(this.race.items){let e=this.race.items.hazardAhead(n,28);e&&(l=e.d>l?e.d-3.2:e.d+3.2)}let u=r.pointAt(c,l,0,ko),d=u.x-n.pos.x,f=u.z-n.pos.z,p=Math.atan2(d,f)-n.heading;for(;p>Math.PI;)p-=Math.PI*2;for(;p<-Math.PI;)p+=Math.PI*2;let m=ot.clamp(-p*2.6,-1,1),h=0;for(let e=1;e<=8;e++)h=Math.max(h,Math.abs(r.curv[r.idx(n.s+e*6)]));let g=Math.sqrt(26/Math.max(.0015,h)),_=1,v=0;a>g*1.25&&!this.driftHold&&(_=0,v=a>g*1.45?.6:0);let y=0;for(let e=0;e<5;e++)y+=r.curv[r.idx(n.s+4+e*5)];y/=5;let b=Math.abs(y)>.018,x=!1;if(n.grounded&&!n.glide.active&&(!this.driftHold&&b&&a>14&&Math.random()<.08*this.skill+.02&&(this.driftHold=!0,this.driftDir=Math.sign(y),i.jumpPressed=!0),this.driftHold)){if(x=!0,n.drift.active){m=ot.clamp(m*1.25,-1,1);let e=Math.abs(y)<.008||Math.sign(y)!==this.driftDir,t=-p*this.driftDir<-.28;(e&&n.drift.level>=1||n.drift.level>=3||e&&n.drift.charge>1.8||t)&&(this.driftHold=!1,x=!1)}else n.grounded&&!n.drift.active&&t-n._hopLandT>.4&&n.airTime===0&&!i.jumpPressed&&(this.driftHold=!1,x=!1);Math.abs(this.kart.proj.d)>r.w[r.idx(n.s)]-1&&(this.driftHold=!1,x=!1)}return!n.grounded&&n.trick.window>0&&n.trick.t<0&&Math.random()<.25*this.skill&&(i.jumpPressed=!0),n.glide.active&&(v=0,_=1),!n.frozen&&a<2&&n.grounded&&n.spin.t<0&&n.respawnT<0?this.stuckT+=e:this.stuckT=Math.max(0,this.stuckT-e),this.stuckT>1.5&&(this.reverseT=1,this.stuckT=0),this.reverseT>0&&(this.reverseT-=e,_=0,v=1,m=-m),this._items(e,t),i.steer=m,i.accel=_,i.brake=v,i.jump=x||this.driftHold&&i.jumpPressed,i}_steerAlong(e,t){let n=this.kart,r=this.track.pointAt(n.s+10,this.lineAt(n.s+10),0,ko),i=Math.atan2(r.x-n.pos.x,r.z-n.pos.z)-n.heading;for(;i>Math.PI;)i-=Math.PI*2;for(;i<-Math.PI;)i+=Math.PI*2;this.c.steer=ot.clamp(-i*2.2,-1,1),this.c.accel=t}_items(e,t){let n=this.kart,r=this.c;if(!n.item||n.itemRoulette>0||(this.itemTimer-=e,this.itemTimer>0))return;let i=this.race,a=n.item,o=!1,s=!1;if(a===`dango`){let e=0;for(let t=1;t<=6;t++)e=Math.max(e,Math.abs(this.track.curv[this.track.idx(n.s+t*8)]));o=e<.012||n.surface!==`road`}else if(a===`daruma`){let e=i.kartAhead(n,45,.25),t=i.kartBehind(n,25);e?o=!0:t&&Math.random()<.5?(o=!0,s=!0):o=Math.random()<.08}else a===`shuriken`?(o=!!i.kartAhead(n,120,1)||n.position===1&&Math.random()<.05,n.position===1&&(s=!0)):a===`makibishi`?(o=!!i.kartBehind(n,30)||Math.random()<.05,s=!0):o=!0;o?(r.itemPressed=!0,r.itemBack=s,this.itemTimer=.8+Math.random()*2.5):this.itemTimer=.4}},jo=new I,Mo=new I,No=[[[`makibishi`,34],[`daruma`,30],[`koban`,24],[`dango1`,12]],[[`daruma`,24],[`makibishi`,16],[`shuriken`,20],[`dango1`,18],[`koban`,10],[`dango3`,12]],[[`shuriken`,24],[`dango3`,24],[`daruma`,14],[`dango1`,14],[`manekineko`,12],[`makibishi`,6],[`kanedarai`,6]],[[`dango3`,30],[`manekineko`,24],[`shuriken`,20],[`kanedarai`,14],[`dango1`,12]]];function Po(e,t){let n=No[e===1?0:e<=3?1:e<=Math.ceil(t*.62)?2:3],r=0;for(let[,e]of n)r+=e;let i=Math.random()*r;for(let[e,t]of n)if(i-=t,i<=0)return e;return n[0][0]}function Fo(e){let t=new U(new r(.35,16,12),new R({color:{dango:16228804,daruma:14165534,shuriken:10134448,makibishi:3355448,manekineko:16777215,kanedarai:14263361,koban:15909424}[e]??16777215,roughness:.4}));t.castShadow=!0;let n=new W;return n.add(t),n}var Io=class{constructor(e,t,n,r){this.race=e,this.scene=t,this.models=n,this.fx=r,this.track=e.track,this.ground=e.ground,this.group=new W,this.group.name=`items`,t.add(this.group),this.boxes=[],this.coins=[],this.projectiles=[],this.hazards=[],this.strikes=[],this._gq={},this._buildBoxes(),this._buildCoins()}model(e,t){try{if(this.models&&this.models.createItemModel)return this.models.createItemModel(e,t)}catch(t){console.warn(`item model failed`,e,t)}return Fo(e)}_buildBoxes(){let e=this.track;for(let t of e.itemRows){let n=e.w[e.idx(t.s)],r=t.count,i=t.spread??n*.62;for(let n=0;n<r;n++){let a=t.d+(r===1?0:-i+2*i*n/(r-1)),o=e.pointAt(t.s,a,1.25,new I),s,c=null;if(this.models&&this.models.createItemBox){let e=this.models.createItemBox();s=e.group||e,c=e.update?e.update.bind(e):null}else s=new U(new Qe(1.1,1.1,1.1),new R({color:6737151,transparent:!0,opacity:.6,emissive:2254591,emissiveIntensity:.6}));s.position.copy(o),this.group.add(s),this.boxes.push({s:t.s,d:a,pos:o,obj:s,upd:c,active:!0,respawnT:0,phase:n*.7})}}}_buildCoins(){let e=this.track;for(let t of e.coinLines){let n=t.s1-t.s0;n<0&&(n+=e.length);for(let r=0;r<t.count;r++){let i=t.s0+n*r/Math.max(1,t.count-1),a=t.d+Math.sin(r*.9)*t.wave,o=t.count>1?r/(t.count-1):0,s=e.pointAt(i,a,t.h+t.arc*Math.sin(Math.PI*o),new I),c=this.model(`koban`);c.traverse(e=>{if(e.isMesh)for(let t of Array.isArray(e.material)?e.material:[e.material])t&&t.emissive&&!t.userData.kobanGlow&&(t.userData.kobanGlow=!0,t.emissive.setHex(11565080),t.emissiveIntensity=Math.max(t.emissiveIntensity||0,.55))}),c.position.copy(s),c.scale.setScalar(1.25),this.group.add(c),this.coins.push({s:i,d:a,pos:s,obj:c,active:!0,respawnT:0,phase:r*.5})}}}nearestBoxAhead(e,t){let n=null,r=t;for(let t of this.boxes){if(!t.active)continue;let i=this.track.forwardDist(e.s,t.s);i>4&&i<r&&(r=i,n=t)}return n}hazardAhead(e,t){for(let n of this.hazards){let r=this.track.forwardDist(e.s,n.s);if(r>2&&r<t&&Math.abs(n.d-e.proj.d)<3.5)return n}return null}_giveItem(e){if(e.item||e.itemRoulette>0)return;let t=Po(e.position,this.race.karts.length);e.itemRoulette=e.isPlayer?1.8:.9,e._pendingItem=t,e.emit(`item_roulette`,{item:t})}_setItem(e,t){t===`dango3`?(e.item=`dango`,e.itemCount=3):t===`dango1`?(e.item=`dango`,e.itemCount=1):(e.item=t,e.itemCount=1),e.emit(`item_get`,{item:e.item,count:e.itemCount})}iconKey(e){return e.item?e.item===`dango`?`dango`+Math.max(1,Math.min(3,e.itemCount)):e.item:null}use(e,t=!1){if(!e.item||e.itemRoulette>0||e.respawnT>=0||e.spin.t>=0)return;let n=e.item;switch(e.forward(jo),n){case`dango`:e.addBoost(1.3,10,`dango`),e.emit(`use_dango`);break;case`koban`:e.coins=Math.min(10,e.coins+3),e.emit(`coin`,{count:3});break;case`manekineko`:e.invincibleT=7.5,e.addBoost(1,6,`star`),e.emit(`star_start`);break;case`kanedarai`:this._kanedarai(e);break;case`makibishi`:this._dropTrap(e,t);break;case`daruma`:this._launch(e,`daruma`,t);break;case`shuriken`:this._launch(e,`shuriken`,t)}e.itemCount--,e.itemCount<=0&&(e.item=null,e.itemCount=0),e.emit(`item_used`,{item:n})}_dropTrap(e,t){let n=e.forward(jo),r=this.model(`makibishi`),i=e.pos.clone().addScaledVector(n,t?0:-2.6),a={type:`makibishi`,pos:i,vel:new I,obj:r,life:45,s:e.s,d:e.proj.d,owner:e,ownerSafe:.6,airborne:!1};t&&(a.vel.copy(n).multiplyScalar(22).add(Mo.set(0,7,0)).add(new I(e.vel.x,0,e.vel.z).multiplyScalar(.5)),a.airborne=!0,a.pos.y+=1.2),r.position.copy(i),this.group.add(r),this.hazards.push(a),e.emit(`drop`)}_launch(e,t,n){let r=e.forward(jo),i=n?-1:1,a=t===`shuriken`?44:38,o=this.model(t),s=e.pos.clone().addScaledVector(r,i*2.2);s.y+=t===`shuriken`?.9:.45;let c=r.clone().multiplyScalar(n?-a*.55:Math.max(a,e.speed+14)),l=null;t===`shuriken`&&!n&&(l=this.race.kartAheadOf(e));let u={type:t,pos:s,vel:c,obj:o,owner:e,life:t===`shuriken`?9:10,age:0,target:l,trackIndex:e.trackIndex,s:e.s,bounces:0,spin:0};o.position.copy(s),this.group.add(o),this.projectiles.push(u),e.emit(`throw`,{item:t})}_kanedarai(e){for(let t of this.race.karts){if(t===e||t.finished||t.raceDist<=e.raceDist)continue;let n=this.model(`kanedarai`);n.position.copy(t.pos).add(Mo.set(0,14,0)),this.group.add(n),this.strikes.push({kart:t,obj:n,t:-.3-Math.random()*.5,hit:!1})}e.emit(`kanedarai_cast`)}_removeObj(e){this.group.remove(e)}update(e,t){let n=this.track,r=this.race.karts;for(let n of this.boxes){if(!n.active){n.respawnT-=e,n.respawnT<=0&&(n.active=!0,n.obj.visible=!0,n.grow=0);continue}n.grow!==void 0&&n.grow<1&&(n.grow=Math.min(1,n.grow+e*3),n.obj.scale.setScalar(n.grow)),n.obj.position.y=n.pos.y+Math.sin(t*2+n.phase)*.15,n.upd?n.upd(e,t):n.obj.rotation.set(t*.7+n.phase,t+n.phase,0);for(let e of r){if(e.respawnT>=0)continue;let t=e.pos.x-n.pos.x,r=e.pos.z-n.pos.z,i=e.pos.y+.6-n.pos.y;if(t*t+r*r<4&&Math.abs(i)<2.2){n.active=!1,n.obj.visible=!1,n.respawnT=1.8,this.fx.burst(n.pos,[.6,.85,1],26,7,.14),e.emit(`itembox`),this._giveItem(e);break}}}for(let n of this.coins){if(!n.active){n.respawnT-=e,n.respawnT<=0&&(n.active=!0,n.obj.visible=!0);continue}n.obj.rotation.y=t*3+n.phase,n.obj.position.y=n.pos.y+Math.sin(t*3+n.phase)*.1;for(let e of r){if(e.respawnT>=0)continue;let t=e.pos.x-n.pos.x,r=e.pos.z-n.pos.z,i=e.pos.y+.5-n.pos.y;if(t*t+r*r<1.6*1.6&&Math.abs(i)<1.8){n.active=!1,n.obj.visible=!1,n.respawnT=10,e.coins<10&&(e.coins++,e.coins,e.addBoost(.25,3,`coin`)),e.emit(`coin`,{count:1}),this.fx.burst(n.pos,[1,.8,.25],10,4,.08);break}}}for(let t of r)t.itemRoulette>0&&(t.itemRoulette-=e,t.itemRoulette<=0&&(t.itemRoulette=0,this._setItem(t,t._pendingItem)));for(let t=this.projectiles.length-1;t>=0;t--){let n=this.projectiles[t];n.age+=e,n.life-=e;let i=n.life<=0;if(i||this._stepProjectile(n,e),!i)for(let e of r){if(e===n.owner&&n.age<.5||e.respawnT>=0)continue;let t=e.pos.x-n.pos.x,r=e.pos.z-n.pos.z,a=e.pos.y+.5-n.pos.y;if(t*t+r*r<1.7*1.7&&Math.abs(a)<2){let t=e.hit((n.type,`tumble`));this.fx.burst(n.pos,n.type===`shuriken`?[.7,.9,1]:[1,.4,.3],30,8,.15),e.emit(t?`hit_by`:`blocked`,{by:n.type,attacker:n.owner}),t&&this._loseCoins(e),i=!0;break}}if(!i)for(let e=this.hazards.length-1;e>=0;e--){let t=this.hazards[e];if(t.pos.distanceToSquared(n.pos)<3.24){this.fx.burst(t.pos,[1,.7,.3],20,6,.12),this._removeObj(t.obj),this.hazards.splice(e,1),i=!0;break}}i&&(this._removeObj(n.obj),this.projectiles.splice(t,1))}for(let t=this.hazards.length-1;t>=0;t--){let i=this.hazards[t];if(i.life-=e,i.ownerSafe-=e,i.airborne){i.vel.y-=30*e,i.pos.addScaledVector(i.vel,e);let t=this.ground.query(i.pos.x,i.pos.y,i.pos.z,-1,this._gq);if(i.pos.y<=t.y){i.pos.y=t.y,i.airborne=!1;let e=n.project(i.pos.x,i.pos.y,i.pos.z,-1);i.s=e.s,i.d=e.d}i.obj.position.copy(i.pos)}let a=i.life<=0;if(!a&&!i.airborne)for(let e of r){if(e===i.owner&&i.ownerSafe>0||e.respawnT>=0||!e.grounded)continue;let t=e.pos.x-i.pos.x,n=e.pos.z-i.pos.z;if(t*t+n*n<2.25&&Math.abs(e.pos.y-i.pos.y)<1.5){let t=e.hit(`spin`);t&&this._loseCoins(e),e.emit(t?`hit_by`:`blocked`,{by:`makibishi`,attacker:i.owner}),this.fx.burst(i.pos,[.9,.9,.9],16,5,.1),a=!0;break}}a&&(this._removeObj(i.obj),this.hazards.splice(t,1))}for(let t=this.strikes.length-1;t>=0;t--){let n=this.strikes[t];n.t+=e;let r=n.kart;if(n.t<0){n.obj.position.set(r.pos.x,r.pos.y+14,r.pos.z);continue}if(n.hit)n.hitT+=e,n.obj.position.set(r.pos.x+n.hitT*3,r.pos.y+1.9+n.hitT*6-15*n.hitT*n.hitT,r.pos.z),n.obj.rotation.z+=e*12,n.hitT>.9&&(this._removeObj(n.obj),this.strikes.splice(t,1));else{let e=14-20*n.t*n.t;if(n.obj.position.set(r.pos.x,r.pos.y+Math.max(1.9,e),r.pos.z),n.obj.rotation.z=Math.sin(n.t*20)*.2,e<=1.9){n.hit=!0,n.hitT=0;let e=r.hit(`squash`,{ignoreSafe:!0});e&&(r.squash=1,this._loseCoins(r)),r.emit(e?`kanedarai_hit`:`blocked`,{by:`kanedarai`}),this.fx.burst(Mo.copy(r.pos).add(jo.set(0,1.8,0)),[1,.9,.4],18,5,.12)}}}}_loseCoins(e){let t=Math.min(e.coins,3);e.coins-=t,t>0&&(this.fx.burst(Mo.copy(e.pos).add(jo.set(0,1,0)),[1,.8,.2],8*t,5,.1),e.emit(`coin_lost`,{count:t}))}_stepProjectile(e,t){let n=this.track;if(e.type===`shuriken`&&e.target&&!e.target.finished){let r=e.target,i=n.project(e.pos.x,e.pos.y,e.pos.z,e.trackIndex);e.trackIndex=i.index;let a=e.pos.distanceTo(r.pos),o;o=a<22?Mo.copy(r.pos).add(jo.set(0,.6,0)):n.pointAt(i.s+12,ot.lerp(i.d,r.proj.d,.5),.9,Mo);let s=jo.copy(o).sub(e.pos).normalize().multiplyScalar(46);e.vel.lerp(s,Math.min(1,t*6)),e.pos.addScaledVector(e.vel,t);let c=this.ground.query(e.pos.x,e.pos.y+1,e.pos.z,e.trackIndex,this._gq);e.pos.y<c.y+.6&&(e.pos.y=c.y+.6),e.obj.position.copy(e.pos),e.obj.rotation.y+=t*25;return}e.pos.x+=e.vel.x*t,e.pos.z+=e.vel.z*t;let r=this.ground.query(e.pos.x,e.pos.y+1.5,e.pos.z,e.trackIndex,this._gq);e.trackIndex=r.proj.index;let i=e.type===`shuriken`?.8:.45;if(r.surface===`deep`||r.y<e.pos.y-6){e.life=0;return}e.pos.y+=(r.y+i-e.pos.y)*Math.min(1,t*20);let a=r.proj,o=a.index,s=n.wallL[o],c=n.wallR[o],l=Math.min(c,n.w[o]+6),u=Math.min(s,n.w[o]+6),d=0;if(a.d>l-.5?d=1:a.d<-(u-.5)&&(d=-1),d!==0){let t=a.frame.right,n=Math.hypot(t.x,t.z)||1,r=t.x/n*d,i=t.z/n*d,o=e.vel.x*r+e.vel.z*i;o>0&&(e.vel.x-=2*o*r,e.vel.z-=2*o*i,e.bounces++,e.owner.emit(`proj_bounce`,{pos:e.pos.clone()}))}if(e.obj.position.copy(e.pos),e.type===`daruma`){let n=Math.hypot(e.vel.x,e.vel.z);e.spin+=n/.4*t,e.obj.rotation.set(0,Math.atan2(e.vel.x,e.vel.z),0),e.obj.rotateX(e.spin)}else e.obj.rotation.y+=t*25}clear(){this.scene.remove(this.group)}},Lo=1/120,Ro=class{constructor(e,t){this.world=e,this.track=e.track,this.ground=e.ground,this.laps=t.laps??3,this.difficulty=t.difficulty||`100cc`,this.fx=t.fx,this.karts=[],this.ai=[],this.state=`pre`,this.time=0,this.simTime=0,this.countT=0,this.acc=0,this.finishOrder=[],this.events=[];let n=[t.player,...t.rivals],r=Math.min(n.length-1,t.playerGrid??n.length-1),i=[],a=1;for(let e=0;e<n.length;e++)i.push(e===r?0:a++);for(let t=0;t<n.length;t++){let r=i[t],a=n[r],o=new To(e,{id:r,character:a.character,name:a.name,stats:a.stats,color:a.color,isPlayer:r===0,difficulty:this.difficulty}),s=t,c=this.track.length-7-s*4.2,l=(s%2==0?-1:1)*3.2;if(o.place(c,l),o.gridSlot=t,o.lapCount=0,this.karts.push(o),r===0)this.player=o;else{let e=_o[this.difficulty].ai,t=Math.min(1,e-.1+r/n.length*.15+Math.random()*.05),i=new Ao(o,this,{skill:t,seed:r*7+3});o.ai=i,o.baseMax*=.93+t*.07,this.ai.push(i)}}this.items=new Io(this,e.scene,t.itemModels,this.fx),this.playerControls={steer:0,accel:0,brake:0,jump:!1,jumpPressed:!1,itemPressed:!1},this._jumpLatch=!1,this._itemLatch=!1,this._itemBack=!1,this.rocket={firstPress:-1},this.updatePositions()}startCountdown(){this.state=`countdown`,this.countT=0,this._lastCount=4}kartAhead(e,t,n=.3){let r=e.forward(zo),i=null,a=t;for(let t of this.karts){if(t===e)continue;let o=t.pos.x-e.pos.x,s=t.pos.z-e.pos.z,c=Math.hypot(o,s);c>a||c<.5||(o*r.x+s*r.z)/c>1-n&&(i=t,a=c)}return i}kartBehind(e,t){let n=e.forward(zo);for(let r of this.karts){if(r===e)continue;let i=r.pos.x-e.pos.x,a=r.pos.z-e.pos.z,o=Math.hypot(i,a);if(o<t&&(i*n.x+a*n.z)/Math.max(o,.01)<-.6)return r}return null}kartAheadOf(e){let t=this.standings,n=t.indexOf(e);return n<=0?null:t[n-1]}updatePositions(){let e=[...this.karts];e.sort((e,t)=>e.finished&&t.finished?e.finishTime-t.finishTime:e.finished?-1:t.finished?1:t.raceDist-e.raceDist),e.forEach((e,t)=>e.position=t+1),this.standings=e}setPlayerInput(e){let t=this.playerControls;t.steer=e.steer,t.accel=e.accel,t.brake=e.brake,t.jump=e.jump,e.jumpPressed&&(this._jumpLatch=!0),e.itemPressed&&(this._itemLatch=!0,this._itemBack=e.brake>.5)}update(e){this.acc+=Math.min(e,.25);let t=0;for(;this.acc>=.008333333333333333&&t<30;)this._step(Lo),this.acc-=Lo,t++;t>=30&&(this.acc=0)}_step(e){if(this.simTime+=e,this.state===`countdown`){this.countT+=e;let t=3-Math.floor(this.countT);if(t!==this._lastCount&&t>=0&&(this._lastCount=t,this.events.push({type:`count`,n:t})),this.playerControls.accel>.5&&this.rocket.firstPress<0&&(this.rocket.firstPress=this.countT),this.countT>=3){this.state=`racing`,this.time=0;for(let e of this.karts)e.frozen=!1,e.lapStart=0;let e=this.rocket.firstPress;e>=1.35&&e<=2.15&&this.playerControls.accel>.5?(this.player.addBoost(1.4,9,`rocket`),this.events.push({type:`rocket`,good:!0})):e>=0&&e<.9&&(this.player.hit(`spin`),this.events.push({type:`rocket`,good:!1}));for(let e of this.karts)!e.isPlayer&&Math.random()<.55&&e.addBoost(1.1,7,`rocket`)}}(this.state===`racing`||this.state===`done`)&&(this.time+=e);for(let t of this.karts){let n;t.isPlayer&&!t.finished&&this.autopilot?(t._autoAI||=new Ao(t,this,{skill:1,seed:5}),n=t._autoAI.update(e,this.time)):t.isPlayer&&!t.finished?(n=this.playerControls,n.jumpPressed=this._jumpLatch,n.itemPressed=this._itemLatch,this._jumpLatch=!1,this._itemLatch=!1):t.ai?n=t.ai.update(e,this.time):(t._autoAI||=new Ao(t,this,{skill:.7,seed:99}),n=t._autoAI.update(e,this.time),n.accel=Math.min(n.accel,.6),n.itemPressed=!1);let r=t.events.length;t.step(e,n,this.simTime);for(let e=r;e<t.events.length;e++)this._onKartEvent(t,t.events[e]);if(n.itemPressed&&!t.frozen){let e=t.isPlayer?this._itemBack:!!n.itemBack;this.items.use(t,e)}n.jumpPressed=!1,n.itemPressed=!1}this._collide(e),this.items.update(e,this.simTime),this.updatePositions();let t=this.player;for(let e of this.karts){if(!e.ai)continue;let n=e.raceDist-t.raceDist,r=ot.clamp(n/180,-1,1);e.rubber=r>0?1-.07*r:1-.1*r,e.baseMaxRubber=e.rubber}for(let e of this.karts)e.ai&&(e.rubberMul=e.rubber??1)}_onKartEvent(e,t){t.type!==`lap`||this.state===`pre`||e.finished||(t.lap>=2&&t.lap-1>e.lapTimes.length&&(e.lapTimes.push(this.time-e.lapStart),e.lapStart=this.time),t.lap>this.laps?(e.finished=!0,e.finishTime=this.time,this.finishOrder.push(e),this.events.push({type:`finish`,kart:e,rank:this.finishOrder.length}),e.isPlayer&&(this.state=`done`)):e.isPlayer&&t.lap===this.laps&&!e._finalLapShown?(e._finalLapShown=!0,this.events.push({type:`final_lap`})):e.isPlayer&&t.lap>=2&&t.lap<this.laps&&this.events.push({type:`lap`,lap:t.lap}))}results(){let e=this.track.length*this.laps/Math.max(1,this.time),t=this.standings.map(t=>{let n=t.finishTime,r=!1;if(n==null){let i=this.track.length*this.laps-Math.max(0,t.raceDist);n=this.time+i/Math.max(8,e*.97),r=!0}return{kart:t,time:n,estimated:r}});return t.sort((e,t)=>e.time-t.time),t}_collide(e){let t=this.karts;for(let e=0;e<t.length;e++){let n=t[e];if(!(n.respawnT>=0))for(let r=e+1;r<t.length;r++){let e=t[r];if(e.respawnT>=0)continue;let i=e.pos.x-n.pos.x,a=e.pos.z-n.pos.z,o=e.pos.y-n.pos.y;if(Math.abs(o)>1.4)continue;let s=i*i+a*a,c=n.radius+e.radius-.2;if(s>c*c||s<1e-6)continue;let l=Math.sqrt(s),u=i/l,d=a/l,f=c-l,p=e.weight/(n.weight+e.weight),m=n.weight/(n.weight+e.weight);n.pos.x-=u*f*p,n.pos.z-=d*f*p,e.pos.x+=u*f*m,e.pos.z+=d*f*m;let h=(e.vel.x-n.vel.x)*u+(e.vel.z-n.vel.z)*d;if(h<0){let t=-1.35*h/(1/n.weight+1/e.weight);n.vel.x-=t/n.weight*u,n.vel.z-=t/n.weight*d,e.vel.x+=t/e.weight*u,e.vel.z+=t/e.weight*d,-h>3&&(n.emit(`bump`,{impact:-h,other:e}),e.emit(`bump`,{impact:-h,other:n}))}n.invincibleT>0&&e.invincibleT<=0?e.hit(`tumble`)&&this.items._loseCoins(e):e.invincibleT>0&&n.invincibleT<=0&&n.hit(`tumble`)&&this.items._loseCoins(n)}}}},zo=new I,Bo=new I,Vo=new I,Ho=new I,Uo=class{constructor(e,t){this.camera=e,this.ground=t,this.mode=`chase`,this.target=null,this.yaw=0,this.pos=new I,this.lookAt=new I,this.fov=62,this.shakeAmt=0,this.shakeT=0,this.lookBack=!1,this.height=2,this.dist=4.7,this.cine=null,this._gq={}}snapTo(e){this.target=e,this.yaw=e.heading;let t=Bo.set(Math.sin(this.yaw),0,Math.cos(this.yaw));this.pos.copy(e.pos).addScaledVector(t,-this.dist).add(Vo.set(0,this.height,0)),this.lookAt.copy(e.pos).addScaledVector(t,3).add(Vo.set(0,1,0)),this.camera.position.copy(this.pos),this.camera.lookAt(this.lookAt)}shake(e){this.shakeAmt=Math.max(this.shakeAmt,e)}playCinematic(e,t){this.mode=`cine`,this.cine={shots:e,t:0,i:0,onDone:t}}update(e){let t=this.camera;if(this.mode===`cine`&&this.cine){let n=this.cine,r=n.shots[n.i];n.t+=e;let i=Math.min(1,n.t/r.dur),a=i*i*(3-2*i);if(r.path){let e=r.path,n=e.s0+(e.s1-e.s0)*(r.ease===!1?i:a*.5+i*.5);t.position.copy(e.track.pointAt(n,e.d??0,e.h??2.5,Bo));let o=e.track.pointAt(n+(e.ahead??12),(e.d??0)*.5,(e.h??2.5)*.6,Vo);t.lookAt(o)}else{let e=Bo.fromArray(r.from),n=Vo.fromArray(r.to);t.position.lerpVectors(e,n,r.ease===!1?i:a);let o=new I().fromArray(r.look);r.lookTo&&o.lerp(new I().fromArray(r.lookTo),a),t.lookAt(o)}t.fov=r.fov??55,t.updateProjectionMatrix(),n.t>=r.dur&&(n.i++,n.t=0,n.i>=n.shots.length&&(this.cine=null,this.mode=`chase`,this.target&&this.snapTo(this.target),n.onDone&&n.onDone()));return}let n=this.target;if(!n)return;if(this.mode===`orbit`){this._orbit=(this._orbit||0)+e*.35;let r=n.heading+Math.PI+this._orbit,i=Bo.set(Math.sin(r)*8.5,4.2,Math.cos(r)*8.5).add(n.pos);t.position.lerp(i,Math.min(1,e*3)),Ho.copy(n.pos).add(Vo.set(0,1,0)),t.lookAt(Ho),t.fov+=(50-t.fov)*Math.min(1,e*2),t.updateProjectionMatrix();return}let r=Math.abs(n.speed),i=Math.min(1.3,r/30),a=n.heading,o=n.driftVisual*-.28;a+=o;let s=a-this.yaw;for(;s>Math.PI;)s-=Math.PI*2;for(;s<-Math.PI;)s+=Math.PI*2;let c=n.grounded?6.5:3.5;this.yaw+=s*Math.min(1,e*c);let l=this.dist+i*.9,u=this.height+i*.15;n.grounded||(u+=Math.min(1.8,n.airTime*2.5),l+=Math.min(1.5,n.airTime*1.5)),n.glide.active&&(u+=1.2,l+=1.6);let d=this.lookBack?-1:1,f=Bo.set(Math.sin(this.yaw),0,Math.cos(this.yaw)).multiplyScalar(d),p=Vo.copy(n.pos).addScaledVector(f,-l);p.y=n.pos.y+u;let m=this.lookBack?30:10;this.pos.x+=(p.x-this.pos.x)*Math.min(1,e*m),this.pos.z+=(p.z-this.pos.z)*Math.min(1,e*m),this.pos.y+=(p.y-this.pos.y)*Math.min(1,e*(n.grounded?8:4));let h=this.ground.query(this.pos.x,this.pos.y,this.pos.z,n.trackIndex,this._gq),g=Math.max(h.y,h.waterY)+.8;if(this.pos.y<g&&(this.pos.y=g),Ho.copy(n.pos).addScaledVector(f,3.2),Ho.y=n.pos.y+1.05+(n.glide.active?-.5:0),this.lookAt.lerp(Ho,Math.min(1,e*14)),t.position.copy(this.pos),this.shakeAmt>.001){this.shakeT+=e*40;let n=this.shakeAmt;t.position.x+=Math.sin(this.shakeT*1.3)*n*.3,t.position.y+=Math.sin(this.shakeT*1.7+1)*n*.3,this.shakeAmt*=Math.exp(-e*7)}n.boostT>0&&(t.position.y+=Math.sin(performance.now()*.05)*.02),t.lookAt(this.lookAt);let _=+(n.boostT>0),v=62+i*9+_*7;this.fov+=(v-this.fov)*Math.min(1,e*4),t.fov=this.fov,t.updateProjectionMatrix()}},Wo=`
attribute vec3 iPos;
attribute vec4 iCol;
attribute vec3 iMisc;   // size, rotation, stretch
attribute vec3 iVel;
varying vec4 vCol;
varying vec2 vUv;
#include <fog_pars_vertex>
void main() {
  vUv = position.xy + 0.5;
  vec4 mvPosition = modelViewMatrix * vec4(iPos, 1.0);
  float size = iMisc.x;
  vec2 corner = position.xy;
#ifdef SPARK
  vec3 vv = (modelViewMatrix * vec4(iVel, 0.0)).xyz;
  float vl = length(vv.xy);
  vec2 dir = vl > 1e-4 ? vv.xy / vl : vec2(0.0, 1.0);
  vec2 perp = vec2(-dir.y, dir.x);
  float st = 1.0 + iMisc.z * vl;
  corner = dir * position.y * st + perp * position.x;
#else
  float c = cos(iMisc.y), s = sin(iMisc.y);
  corner = vec2(c * corner.x - s * corner.y, s * corner.x + c * corner.y);
#endif
  mvPosition.xy += corner * size;
  gl_Position = projectionMatrix * mvPosition;
  vCol = iCol;
  #include <fog_vertex>
}
`,Go=`
uniform float uIntensity;
varying vec4 vCol;
varying vec2 vUv;
#include <fog_pars_fragment>
void main() {
  vec2 p = vUv - 0.5;
  float a;
#if defined(PETAL)
  // petal: notched ellipse
  vec2 q = vec2(p.x * 1.6, p.y);
  float e = length(q) * 2.0;
  float notch = smoothstep(0.08, 0.0, abs(p.x)) * smoothstep(0.2, 0.45, p.y);
  a = smoothstep(1.0, 0.85, e) * (1.0 - notch);
  vec3 col = vCol.rgb * (0.85 + 0.3 * (0.5 - p.y));
#elif defined(RING)
  float r = length(p) * 2.0;
  a = smoothstep(1.0, 0.8, r) * smoothstep(0.55, 0.8, r);
  vec3 col = vCol.rgb;
#elif defined(SPARK)
  float r = length(p * vec2(2.2, 1.0)) * 2.0;
  a = smoothstep(1.0, 0.0, r);
  a = a * a;
  vec3 col = vCol.rgb;
#else
  float r = length(p) * 2.0;
  a = smoothstep(1.0, 0.0, r);
  a *= a * (3.0 - 2.0 * a);
  vec3 col = vCol.rgb;
#endif
  a *= vCol.a;
  if (a < 0.003) discard;
  gl_FragColor = vec4(col * uIntensity, a);
  #include <fog_fragment>
}
`,Ko=class{constructor(e=2e3,t={}){this.max=e,this.count=0;let n=new se(1,1),r=new pe;r.index=n.index,r.setAttribute(`position`,n.attributes.position),this.aPos=new ue(new Float32Array(e*3),3).setUsage(Ue),this.aCol=new ue(new Float32Array(e*4),4).setUsage(Ue),this.aMisc=new ue(new Float32Array(e*3),3).setUsage(Ue),this.aVel=new ue(new Float32Array(e*3),3).setUsage(Ue),r.setAttribute(`iPos`,this.aPos),r.setAttribute(`iCol`,this.aCol),r.setAttribute(`iMisc`,this.aMisc),r.setAttribute(`iVel`,this.aVel),r.instanceCount=0,this.geo=r;let i={};t.shape===`spark`&&(i.SPARK=``),t.shape===`petal`&&(i.PETAL=``),t.shape===`ring`&&(i.RING=``);let a=t.fog!==!1;this.mat=new P({uniforms:fe.merge([G.fog,{uIntensity:{value:t.intensity??1}}]),vertexShader:Wo,fragmentShader:Go,defines:i,transparent:!0,depthWrite:!1,blending:t.additive?2:1,fog:a,side:2}),Object.assign(this.mat.uniforms,la.uniforms()),this.mesh=new U(r,this.mat),this.mesh.frustumCulled=!1,this.mesh.renderOrder=t.renderOrder??10,this.px=new Float32Array(e),this.py=new Float32Array(e),this.pz=new Float32Array(e),this.vx=new Float32Array(e),this.vy=new Float32Array(e),this.vz=new Float32Array(e),this.life=new Float32Array(e),this.age=new Float32Array(e),this.s0=new Float32Array(e),this.s1=new Float32Array(e),this.cr=new Float32Array(e),this.cg=new Float32Array(e),this.cb=new Float32Array(e),this.a0=new Float32Array(e),this.a1=new Float32Array(e),this.grav=new Float32Array(e),this.drag=new Float32Array(e),this.rot=new Float32Array(e),this.vrot=new Float32Array(e),this.stretch=new Float32Array(e),this.flutter=new Float32Array(e),this.floorY=new Float32Array(e)}spawn(e){if(this.count>=this.max)return;let t=this.count++;this.px[t]=e.x,this.py[t]=e.y,this.pz[t]=e.z,this.vx[t]=e.vx||0,this.vy[t]=e.vy||0,this.vz[t]=e.vz||0,this.life[t]=e.life||1,this.age[t]=0,this.s0[t]=e.size??.5,this.s1[t]=e.size1??this.s0[t],this.cr[t]=e.r??1,this.cg[t]=e.g??1,this.cb[t]=e.b??1,this.a0[t]=e.a??1,this.a1[t]=e.a1??0,this.grav[t]=e.grav??0,this.drag[t]=e.drag??0,this.rot[t]=e.rot??Math.random()*6.28,this.vrot[t]=e.vrot??0,this.stretch[t]=e.stretch??.05,this.flutter[t]=e.flutter??0,this.floorY[t]=e.floorY??-1e9}_kill(e){let t=--this.count;e!==t&&(this.px[e]=this.px[t],this.py[e]=this.py[t],this.pz[e]=this.pz[t],this.vx[e]=this.vx[t],this.vy[e]=this.vy[t],this.vz[e]=this.vz[t],this.life[e]=this.life[t],this.age[e]=this.age[t],this.s0[e]=this.s0[t],this.s1[e]=this.s1[t],this.cr[e]=this.cr[t],this.cg[e]=this.cg[t],this.cb[e]=this.cb[t],this.a0[e]=this.a0[t],this.a1[e]=this.a1[t],this.grav[e]=this.grav[t],this.drag[e]=this.drag[t],this.rot[e]=this.rot[t],this.vrot[e]=this.vrot[t],this.stretch[e]=this.stretch[t],this.flutter[e]=this.flutter[t],this.floorY[e]=this.floorY[t])}update(e,t=0){let n=this.aPos.array,r=this.aCol.array,i=this.aMisc.array,a=this.aVel.array,o=0;for(;o<this.count;){if(this.age[o]+=e,this.age[o]>=this.life[o]){this._kill(o);continue}let s=this.age[o]/this.life[o],c=Math.exp(-this.drag[o]*e);if(this.vx[o]*=c,this.vy[o]*=c,this.vz[o]*=c,this.vy[o]-=this.grav[o]*e,this.flutter[o]>0){let n=this.flutter[o];this.vx[o]+=Math.sin(t*2.1+o*1.7)*n*e,this.vz[o]+=Math.cos(t*1.7+o*2.3)*n*e}this.px[o]+=this.vx[o]*e,this.py[o]+=this.vy[o]*e,this.pz[o]+=this.vz[o]*e,this.py[o]<this.floorY[o]&&(this.py[o]=this.floorY[o],this.vy[o]*=-.3,this.vx[o]*=.6,this.vz[o]*=.6),this.rot[o]+=this.vrot[o]*e;let l=o*3,u=o*4;n[l]=this.px[o],n[l+1]=this.py[o],n[l+2]=this.pz[o],a[l]=this.vx[o],a[l+1]=this.vy[o],a[l+2]=this.vz[o],r[u]=this.cr[o],r[u+1]=this.cg[o],r[u+2]=this.cb[o],r[u+3]=this.a0[o]+(this.a1[o]-this.a0[o])*s,i[l]=this.s0[o]+(this.s1[o]-this.s0[o])*s,i[l+1]=this.rot[o],i[l+2]=this.stretch[o],o++}this.geo.instanceCount=this.count,this.count>0&&(this.aPos.needsUpdate=!0,this.aCol.needsUpdate=!0,this.aMisc.needsUpdate=!0,this.aVel.needsUpdate=!0,this.aPos.clearUpdateRanges(),this.aPos.addUpdateRange(0,this.count*3),this.aCol.clearUpdateRanges(),this.aCol.addUpdateRange(0,this.count*4),this.aMisc.clearUpdateRanges(),this.aMisc.addUpdateRange(0,this.count*3),this.aVel.clearUpdateRanges(),this.aVel.addUpdateRange(0,this.count*3))}clear(){this.count=0,this.geo.instanceCount=0}},qo=class{constructor(e){this.sparks=new Ko(3e3,{additive:!0,shape:`spark`,intensity:3,renderOrder:12}),this.glow=new Ko(1500,{additive:!0,shape:`soft`,intensity:2,renderOrder:12}),this.smoke=new Ko(2500,{additive:!1,shape:`soft`,intensity:1,renderOrder:11}),this.petals=new Ko(2500,{additive:!1,shape:`petal`,intensity:1,renderOrder:11}),this.rings=new Ko(200,{additive:!0,shape:`ring`,intensity:2,renderOrder:12}),this.fireworks=new Ko(6e3,{additive:!0,shape:`spark`,intensity:4,fog:!1,renderOrder:13}),this.systems=[this.sparks,this.glow,this.smoke,this.petals,this.rings,this.fireworks];for(let t of this.systems)e.add(t.mesh);this.time=0}update(e){this.time+=e;for(let t of this.systems)t.update(e,this.time)}clear(){for(let e of this.systems)e.clear()}dispose(e){for(let t of this.systems)e.remove(t.mesh),t.geo.dispose(),t.mat.dispose()}driftSparks(e,t,n,r,i,a){let o=r>=3?[1,.35,1]:r===2?[1,.55,.12]:r===1?[.3,.6,1]:[1,.9,.6],s=r>0?3:1;for(let c=0;c<s;c++){let s=3+Math.random()*5;this.sparks.spawn({x:e.x,y:e.y+.08,z:e.z,vx:-t*s+Math.random()*3*i+(Math.random()-.5)*2,vy:1.5+Math.random()*3.5,vz:-n*s+Math.random()*3*a+(Math.random()-.5)*2,life:.25+Math.random()*.25,size:r>0?.09:.06,size1:.02,r:o[0],g:o[1],b:o[2],a:1,a1:.2,grav:14,drag:2,stretch:.06})}r>0&&Math.random()<.6&&this.glow.spawn({x:e.x,y:e.y+.15,z:e.z,life:.12,size:.5+r*.12,size1:.2,r:o[0],g:o[1],b:o[2],a:.8,a1:0})}boostFlame(e,t,n,r=1,i=[1,.55,.15]){this.glow.spawn({x:e.x+(Math.random()-.5)*.05,y:e.y+(Math.random()-.5)*.05,z:e.z+(Math.random()-.5)*.05,vx:-t*(4+Math.random()*3),vy:.4,vz:-n*(4+Math.random()*3),life:.14+Math.random()*.08,size:.32*r,size1:.08,r:i[0],g:i[1],b:i[2],a:.9,a1:0})}dust(e,t=[.55,.45,.35],n=1,r=null){for(let i=0;i<n;i++)this.smoke.spawn({x:e.x+(Math.random()-.5)*.6,y:e.y+.15,z:e.z+(Math.random()-.5)*.6,vx:(r?r.x*.2:0)+(Math.random()-.5)*1.5,vy:.6+Math.random()*1,vz:(r?r.z*.2:0)+(Math.random()-.5)*1.5,life:.7+Math.random()*.6,size:.5,size1:1.8+Math.random(),r:t[0],g:t[1],b:t[2],a:.35,a1:0,drag:1.5,vrot:(Math.random()-.5)*2})}splash(e,t=6,n=1){for(let r=0;r<t;r++){let t=Math.random()*Math.PI*2,r=(1.5+Math.random()*3)*n;this.sparks.spawn({x:e.x,y:e.y+.1,z:e.z,vx:Math.cos(t)*r,vy:(3+Math.random()*4)*n,vz:Math.sin(t)*r,life:.5+Math.random()*.3,size:.07,size1:.05,r:.35,g:.42,b:.5,a:.9,a1:0,grav:16,stretch:.05})}this.smoke.spawn({x:e.x,y:e.y+.2,z:e.z,vy:1.2,life:.5,size:.6,size1:2.2,r:.85,g:.88,b:.92,a:.35,a1:0})}burst(e,t=[1,.9,.5],n=24,r=6,i=.12){for(let a=0;a<n;a++){let n=Math.random()*2-1,a=Math.random()*Math.PI*2,o=Math.sqrt(1-n*n),s=r*(.6+Math.random()*.6);this.sparks.spawn({x:e.x,y:e.y,z:e.z,vx:o*Math.cos(a)*s,vy:n*s+2,vz:o*Math.sin(a)*s,life:.4+Math.random()*.4,size:i,size1:.02,r:t[0],g:t[1],b:t[2],a:1,a1:0,grav:6,drag:2.5,stretch:.05})}this.rings.spawn({x:e.x,y:e.y,z:e.z,life:.35,size:.4,size1:4,r:t[0],g:t[1],b:t[2],a:.9,a1:0})}firework(e,t,n=`peony`){let r=n===`willow`?200:280,i=n===`willow`?22:34,a=[Math.min(1,t[0]+.4),Math.min(1,t[1]+.4),Math.min(1,t[2]+.4)];for(let o=0;o<r;o++){let r=Math.random()*2-1,o=Math.random()*Math.PI*2,s=Math.sqrt(1-r*r),c=i*(.85+Math.random()*.3),l=Math.random()<.3?a:t;this.fireworks.spawn({x:e.x,y:e.y,z:e.z,vx:s*Math.cos(o)*c,vy:r*c,vz:s*Math.sin(o)*c,life:n===`willow`?2.8+Math.random()*.8:1.6+Math.random()*.6,size:n===`willow`?1.8:2.4,size1:.6,r:l[0],g:l[1],b:l[2],a:1,a1:0,grav:n===`willow`?5:3,drag:n===`willow`?1.4:1.6,stretch:.09})}this.glow.spawn({x:e.x,y:e.y,z:e.z,life:.35,size:18,size1:34,r:t[0],g:t[1],b:t[2],a:.35,a1:0})}confetti(e,t=80){let n=[[1,.3,.3],[1,.85,.2],[.3,.7,1],[.4,.95,.5],[1,.5,.85]];for(let r=0;r<t;r++){let t=n[r%n.length];this.petals.spawn({x:e.x+(Math.random()-.5)*3,y:e.y+2+Math.random()*2,z:e.z+(Math.random()-.5)*3,vx:(Math.random()-.5)*8,vy:4+Math.random()*6,vz:(Math.random()-.5)*8,life:2.5+Math.random()*1.5,size:.22,size1:.22,r:t[0],g:t[1],b:t[2],a:1,a1:.8,grav:5,drag:1.8,vrot:(Math.random()-.5)*10,flutter:3})}}},Jo=new I;new I,new p;function Yo(e){let t=new W,n=new W;t.add(n);let i=new U(new Qe(1.3,.45,1.9),new R({color:e,roughness:.4}));i.position.y=.45,i.castShadow=!0,n.add(i);let a=new U(new r(.35,16,12),new R({color:9071178}));a.position.set(0,1.15,-.2),a.castShadow=!0,n.add(a);let o=new ve;return o.position.set(0,1.4,-.4),n.add(o),{root:t,body:n,gliderMount:o,exhaustPoints:[new I(-.3,.45,-1),new I(.3,.45,-1)],rearWheelContacts:[new I(.7,0,-.65),new I(-.7,0,-.65)],radius:1,animate(){},dispose(){}}}function Xo(){return new P({uniforms:{uTime:{value:0},uColor:{value:new B(1,.8,.25)}},vertexShader:`
      varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,fragmentShader:`
      uniform float uTime; uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
      void main(){ float f = 1.0 - max(dot(normalize(vN), normalize(vV)), 0.0); f = pow(f, 2.0);
        float pulse = 0.75 + 0.25 * sin(uTime * 12.0);
        vec3 c = mix(uColor, vec3(1.0, 0.4, 0.8), 0.5 + 0.5 * sin(uTime * 3.0));
        gl_FragColor = vec4(c * 2.5 * pulse, f * 0.9); }`,transparent:!0,depthWrite:!1,blending:2})}var Zo=class{constructor(e,t,n,i){this.kart=e,this.fx=i,this.scene=n;let a=null;try{t&&t.createKartModel&&(a=t.createKartModel(e.character))}catch(e){console.warn(`kart model failed`,e)}a||=Yo(new B(e.color)),this.model=a,n.add(a.root),this.glider=null;try{t&&t.createGlider&&(this.glider=t.createGlider(e.character),a.gliderMount.add(this.glider.group),this.glider.setOpen(0),this.glider.group.visible=!1)}catch(e){console.warn(`glider failed`,e),this.glider=null}this.gliderOpen=0,this.aura=new U(new r(1.35,24,16),Xo()),this.aura.scale.set(1,.85,1.25),this.aura.position.y=.7,this.aura.visible=!1,a.root.add(this.aura),this.state={speed:0,steer:0,driftDir:0,driftLevel:0,boosting:!1,airborne:!1,gliding:!1,trickT:-1,trickType:`flip`,squash:0,spinOut:!1,time:0},this._fxAcc=0,this.visible=!0}update(e,t){let n=this.kart,r=this.model,i=n.respawnT>=0&&n.respawnT<.9;i!==!this.visible&&(this.visible=!i,r.root.visible=this.visible,i&&this.fx.dust(n.pos,[.9,.9,.95],10)),r.root.position.copy(n.pos),n.renderQuaternion(r.root.quaternion);let a=this.state;a.speed=n.speed,a.steer=n.steerSmooth,a.driftDir=n.drift.active?n.drift.dir:0,a.driftLevel=n.drift.level,a.boosting=n.boostT>0,a.airborne=!n.grounded,a.gliding=n.glide.active,a.trickT=n.trick.t,a.trickType=n.trick.type,a.squash=n.squash,a.spinOut=n.spin.t>=0,a.time=t;try{r.animate(e,a)}catch(e){this._warned||=(console.warn(e),!0)}if(this.glider){let t=+!!n.glide.active;this.gliderOpen+=(t-this.gliderOpen)*Math.min(1,e*(t?5:7)),this.gliderOpen<.01&&!t&&(this.gliderOpen=0),this.glider.group.visible=this.gliderOpen>.01,this.glider.setOpen(this.gliderOpen)}if(this.aura.visible=n.invincibleT>0,this.aura.visible&&(this.aura.material.uniforms.uTime.value=t,Math.random()<e*30&&(Jo.set((Math.random()-.5)*2,Math.random()*1.6,(Math.random()-.5)*2.4).applyQuaternion(r.root.quaternion).add(n.pos),this.fx.sparks.spawn({x:Jo.x,y:Jo.y,z:Jo.z,vy:1.5,life:.5,size:.12,size1:.02,r:1,g:.85,b:.3,a:1,a1:0}))),!this.visible)return;let o=Math.sin(n.heading),s=Math.cos(n.heading);if(n.drift.active&&n.grounded){let t=n.drift.level;for(let e of r.rearWheelContacts)Jo.copy(e).applyQuaternion(r.root.quaternion).add(n.pos),Math.random()<(t>0?1:.5)&&this.fx.driftSparks(Jo,o,s,t,-n.drift.dir*-s,-n.drift.dir*o);Math.random()<e*20&&this.fx.dust(Jo,[.6,.58,.55],1)}if(n.boostT>0){let e=n.boostKind===`turbo3`?[1,.4,1]:n.boostKind===`turbo1`?[.4,.7,1]:[1,.55,.15];for(let t of r.exhaustPoints)Jo.copy(t).applyQuaternion(r.root.quaternion).add(n.pos),this.fx.boostFlame(Jo,o,s,1+Math.min(1,n.boostPower/10),e),this.fx.boostFlame(Jo,o,s,.6,[1,.9,.6])}let c=Math.abs(n.speed);if(n.grounded&&c>5){if(this._fxAcc+=e,n.surface===`grass`||n.surface===`dirt`||n.surface===`sand`){if(this._fxAcc>(n.surface===`dirt`?.05:.08)){this._fxAcc=0;for(let e of r.rearWheelContacts)Jo.copy(e).applyQuaternion(r.root.quaternion).add(n.pos),this.fx.dust(Jo,n.surface===`grass`?[.42,.45,.3]:[.6,.5,.38],1,n.vel)}}else if((n.surface===`paddy`||n.surface===`water`)&&this._fxAcc>.03){this._fxAcc=0;for(let e of r.rearWheelContacts)Jo.copy(e).applyQuaternion(r.root.quaternion).add(n.pos),Jo.y=Math.max(Jo.y,this.kart.world.stage.waterLevelAt?this.kart.world.stage.waterLevelAt(Jo.x,Jo.z):Jo.y),this.fx.splash(Jo,3,.7+c/40)}}}dispose(){this.scene.remove(this.model.root),this.model.dispose&&this.model.dispose()}},Qo=()=>{},$o=new I;function es(e){return new Proxy(e||{},{get(e,t){let n=e[t];return typeof n==`function`?n.bind(e):n===void 0?Qo:n}})}var ts=class{constructor(e,{ui:t=null,audio:n=null,stages:r=[],characters:i=[],kartApi:a=null,itemApi:o=null}={}){this.app=e,this.renderer=new ma(e),this.input=new ha,this.camera=new Ce(62,innerWidth/innerHeight,.3,6e3),this.camera.layers.enable(1),this.ui=es(t),this.audio=es(n),this.stages=r,this.characters=i,this.kartApi=a,this.itemApi=o,this.world=null,this.race=null,this.views=[],this.fx=null,this.rig=null,this.mode=`idle`,this.time=0,this.paused=!1,this.menuScene=null,this._last=performance.now(),this.onRaceEnd=null,this.onQuit=null,this.debug=null,requestAnimationFrame(e=>this._frame(e))}async loadRace({courseId:e,characterId:t,difficulty:n=`100cc`,playerGrid:r=5}){this.mode=`loading`,this.disposeRace(),this._resultsShown=!1,this._hitFlash=0,this._sunVis=0;let i=this.stages.find(t=>t.id===e)||this.stages[0];this.def=i,await new Promise(e=>setTimeout(e,30));let a=new go(this.renderer,i,{quality:this.quality});await a.decorate({fx:null,audio:this.audio}),this.world=a,this.fx=new qo(a.scene),a.fx=this.fx,a.stageRuntime&&a.stageRuntime.attachFX&&a.stageRuntime.attachFX(this.fx);let o=this.characters,s=o.find(e=>e.id===t)||o[0],c=o.filter(e=>e.id!==s.id).slice(0,7),l=e=>({character:e.id,name:e.name,stats:e.stats,color:`#`+new B(e.colors?e.colors.body:16777215).getHexString()});if(this.race=new Ro(a,{laps:i.laps??3,difficulty:n,player:l(s),rivals:c.map(l),fx:this.fx,itemModels:this.itemApi,playerGrid:r}),this.views=this.race.karts.map(e=>new Zo(e,this.kartApi,a.scene,this.fx)),i.env.headlights){let e=this.views.find(e=>e.kart.isPlayer),t=new He(16773336,90,45,.55,.6,1.6);t.position.set(0,.9,.9),t.target.position.set(0,0,14),e.model.root.add(t,t.target)}this.rig=new Uo(this.camera,a.ground),this.rig.target=this.race.player,this.devFlags&&this.devFlags.autopilot&&(this.race.autopilot=!0),this.devFlags&&this.devFlags.laps&&(this.race.laps=this.devFlags.laps),this.renderer.setScene(a.scene,this.camera),this.renderer.setLook(i.env.look),this.renderer.scenePass.beforeRender=a.beforeRender?e=>a.beforeRender(e,this.camera):null,this.ui.setMinimap(a.track.minimapPath(4)),this.rig.snapTo(this.race.player);let u=new W;if(this.itemApi&&this.itemApi.createItemModel)for(let e of[`dango`,`daruma`,`shuriken`,`makibishi`,`manekineko`,`kanedarai`,`koban`])try{u.add(this.itemApi.createItemModel(e))}catch{}u.position.copy(this.race.player.pos),a.scene.add(u),this.renderer.renderer.compile(a.scene,this.camera),a.scene.remove(u),this.courseDef=i,this.mode=`intro`,this._introStart()}disposeRace(){let e=this.renderer.fx;if(e.uSunVis.value=0,e.uBoost.value=0,e.uSpeedLines.value=0,e.uCA.value=.004,e.uFlash.value=0,clearTimeout(this._resultsTimer),this._resultsTimer=null,this._resultsShown=!1,this.ui.hideHUD(),this.ui.showWrongWay(!1),!this.world)return;let t=this.world.stageRuntime;if(t&&t.dispose)try{t.dispose()}catch(e){console.warn(`stage dispose failed`,e)}for(let e of this.views)e.dispose();this.views=[],this.fx&&this.fx.dispose(this.world.scene),this.world.scene.traverse(e=>{e.geometry&&e.geometry.dispose()}),this.world.env&&this.world.env.dispose(),this.world.water&&this.world.water.dispose(),this.renderer.scenePass.beforeRender=null,this.world=null,this.race=null,this.audio.engineStop(),this.audio.stopAmbience(),this.audio.driftUpdate(!1,0),this._starLoop&&=(this._starLoop.stop(),null)}_introStart(){let e=this.world.track,t=this.race.player,n;try{n=this.def.introShots?[...this.def.introShots(e),ns(e,t)]:rs(e,t)}catch(r){console.warn(`intro shots failed`,r),n=rs(e,t)}this.ui.hideMenus(),this.ui.showHUD(),this.ui.banner(this.def.name,{style:`info`,durationMs:3200}),this.audio.playAmbience(this.def.ambience||this.def.id),this.audio.playJingle(`start`),this.rig.playCinematic(n,()=>this._beginCountdown()),this._skipIntro=()=>{this.mode===`intro`&&(this.rig.cine=null,this.rig.mode=`chase`,this.rig.snapTo(this.race.player),this._beginCountdown())}}_beginCountdown(){this.mode===`intro`&&(this.mode=`countdown`,this.rig.mode=`chase`,this.rig.snapTo(this.race.player),this.race.startCountdown(),this.audio.engineStart())}_frame(e){requestAnimationFrame(e=>this._frame(e));let t=Math.min(.1,Math.max(0,(e-this._last)/1e3))*(this.timeScale||1);this._last=e,this.input.pollGamepad();for(let e of this.input.menuActions)e!==`start`&&this.ui.nav(e);if(this.mode===`idle`||this.mode===`loading`||!this.world){this.menuRender&&this.menuRender(t),this.input.endFrame();return}let n=[`intro`,`countdown`,`racing`,`finished`].includes(this.mode);if(this.input.gameActive=n,n&&this.input.pausePressed()&&this.mode!==`finished`&&this.togglePause(),this.paused){this.renderer.render(0),this.input.endFrame();return}this.time+=t;let r=this.input.controls();this.mode===`intro`&&(r.jumpPressed||r.itemPressed||this.input.hit(`Enter`))&&this._skipIntro();let i=this.race;(this.mode===`countdown`||this.mode===`racing`||this.mode===`finished`)&&(i.setPlayerInput(r),i.update(t),this.mode===`countdown`&&i.state===`racing`&&(this.mode=`racing`,this.audio.playMusic(this.def.bgm||this.def.id,{fadeIn:.3}))),this.rig.lookBack=r.lookBack&&this.mode===`racing`;for(let e of this.views)e.update(t,this.time);this.world.update(t,this.time,{race:i,camera:this.camera,fx:this.fx,audio:this.audio}),this.fx.update(t),this.rig.update(t),this.world.env.update(t,this.camera),this._handleEvents(),this._updateHUD(t),this._updateAudio(t),this._updatePost(t),this.renderer.render(t),this.debug&&this.debug(t);for(let e of i.karts)e.events.length=0;this.input.endFrame()}togglePause(){this.race&&(this.paused=!this.paused,this.paused?(this.audio.engineStop(),this.audio.driftUpdate(!1,0),this.ui.showPause({onResume:()=>this.togglePause(),onRestart:()=>{this.paused=!1,this.ui.hidePause(),this.restart()},onQuit:()=>{this.paused=!1,this.ui.hidePause(),this.quitToMenu()}})):(this.ui.hidePause(),this.audio.engineStart()))}async restart(){let e=this._lastOpts;e&&(await this.ui.fade(!0,300),this.ui.showLoading(`コースを準備中…`),await this.loadRace(e),this.ui.hideLoading(),await this.ui.fade(!1,400))}quitToMenu(){this.audio.stopMusic({fadeOut:.5}),this.disposeRace(),this.mode=`idle`,this.onQuit&&this.onQuit()}async startRace(e){this._lastOpts=e,await this.ui.fade(!0,350),this.ui.hideMenus(),this.ui.showLoading(`コースを準備中…`),this.audio.stopMusic({fadeOut:.4}),await this.loadRace(e),this.ui.hideLoading(),await this.ui.fade(!1,500)}_handleEvents(){let e=this.race,t=e.player;for(let n of e.events)switch(n.type){case`count`:this.ui.countdown(n.n),this.audio.play(n.n===0?`go`:`count`);break;case`rocket`:n.good?this.ui.toast(`ロケットスタート！`):this.ui.toast(`エンスト…`);break;case`lap`:this.ui.banner(`LAP ${n.lap}/${e.laps}`,{style:`lap`,durationMs:1500}),this.audio.play(`lap`);break;case`final_lap`:this.ui.banner(`ファイナルラップ！`,{style:`final`,durationMs:2200}),this.audio.playJingle(`final_lap`),this.audio.setFinalLap(!0);break;case`finish`:n.kart===t&&this._playerFinished(n.rank)}e.events.length=0;for(let n of e.karts){let e=n===t,r=n.pos.distanceTo(this.camera.position),i=Math.max(0,1-r/45);for(let t of n.events)e?this._playerEvent(n,t):i>.05&&this._rivalEvent(n,t,i)}}_playerEvent(e,t){let n=this.audio;switch(t.type){case`hop`:n.play(`drift_hop`,{volume:.7});break;case`boost`:t.kind===`turbo1`?n.play(`turbo1`):t.kind===`turbo2`?n.play(`turbo2`):t.kind===`turbo3`?n.play(`turbo3`):t.kind===`dash`?n.play(`dash_panel`):(t.kind===`dango`||t.kind===`rocket`)&&n.play(`boost`);break;case`launch`:n.play(`jump`),t.ramp===`glide`&&n.play(`glider_open`);break;case`glide_start`:n.play(`glider_open`),this.ui.toast(`和傘グライダー！`);break;case`trick`:n.play(`trick`);break;case`trick_land`:this.ui.toast(`ナイス！`);break;case`land`:n.play(`land`,{volume:Math.min(1,t.impact/12)}),this.rig.shake(Math.min(.5,t.impact/30)),this.fx.dust(e.pos,[.6,.55,.5],6);break;case`wall`:n.play(`wall`,{volume:Math.min(1,t.impact/12)}),this.rig.shake(.25);break;case`bump`:n.play(`bump`,{volume:Math.min(1,t.impact/10)}),this.rig.shake(.15);break;case`hit`:n.play(`hit`),n.play(`spinout`),this.rig.shake(.6),this._hitFlash=1;break;case`kanedarai_hit`:n.play(`kanedarai`);break;case`itembox`:n.play(`itembox`);break;case`item_roulette`:this.ui.rouletteItem(this._iconKeyForPending(t.item),1800);break;case`item_used`:t.item===`daruma`&&n.play(`throw`),t.item===`shuriken`&&n.play(`shuriken`),t.item===`makibishi`&&n.play(`makibishi_drop`),t.item===`kanedarai`&&n.play(`kanedarai`,{volume:.4,pitch:1.3});break;case`star_start`:n.play(`manekineko`),this._starLoop&&this._starLoop.stop(),this._starLoop=n.startLoop(`star_music`,{volume:.8});break;case`coin`:n.play(`coin`);break;case`respawn_start`:n.play(`respawn`),Promise.resolve(this.ui.fade(!0,300,{style:`black`})).then(()=>setTimeout(()=>this.ui.fade(!1,350,{style:`black`}),250));break;case`proj_bounce`:n.play(`daruma_bounce`,{volume:.5})}}_rivalEvent(e,t,n){let r=this.audio,i=n;switch(t.type){case`hit`:r.play(`hit`,{volume:i*.8});break;case`kanedarai_hit`:r.play(`kanedarai`,{volume:i});break;case`bump`:r.play(`bump`,{volume:i*.6});break;case`boost`:(t.kind===`turbo2`||t.kind===`turbo3`||t.kind===`dango`)&&r.play(`boost`,{volume:i*.35});break;case`proj_bounce`:r.play(`daruma_bounce`,{volume:i*.5});break;case`throw`:r.play(`throw`,{volume:i*.5})}}_iconKeyForPending(e){return e}_playerFinished(e){this.mode=`finished`,this.rig.mode=`orbit`,this.ui.banner(`ゴール！`,{style:`finish`,durationMs:3e3}),this.audio.setFinalLap(!1),this.audio.stopMusic({fadeOut:.3}),this.audio.playJingle(e<=3?`finish_win`:`finish_lose`),this.fx.confetti(this.race.player.pos,120),clearTimeout(this._resultsTimer);let t=this.race;this._resultsTimer=setTimeout(()=>{this._resultsTimer=null,!(this.mode!==`finished`||this.race!==t||this._resultsShown)&&this._showResults()},4200)}_showResults(){this.mode=`results`;let e=this.race.results().map((e,t)=>({rank:t+1,name:e.kart.name,characterId:e.kart.character,time:e.time,estimated:e.estimated,isPlayer:e.kart.isPlayer,color:e.kart.color}));this.audio.playMusic(`results`,{fadeIn:1}),this.ui.hideHUD(),document.querySelectorAll(`.pk-toast`).forEach(e=>e.remove()),this.ui.showResults({rows:e,courseName:this.def.name,onRetry:()=>this.restart(),onCourseSelect:()=>this.quitToMenu(),onTitle:()=>{this.audio.stopMusic({fadeOut:.5}),this.disposeRace(),this.mode=`idle`,this.onTitle&&this.onTitle()}}),this.mode=`finished`,this._resultsShown=!0}_updateHUD(e){let t=this.race,n=t.player;this._resultsShown||(this.ui.updateHUD({position:n.position,total:t.karts.length,lap:Math.max(1,Math.min(t.laps,n.lapCount)),laps:t.laps,time:t.time,coins:n.coins,speedKmh:Math.abs(n.speed)*3.6,item:n.itemRoulette>0?void 0:t.items.iconKey(n),itemCount:n.item===`dango`?1:n.itemCount}),this.ui.showWrongWay(n.wrongWayT>1.3&&this.mode===`racing`));let r=t.karts.map(e=>({x:e.pos.x,z:e.pos.z,color:e.color,isPlayer:e.isPlayer}));this.ui.updateMinimap(r)}_updateAudio(e){let t=this.race.player;(this.mode===`racing`||this.mode===`countdown`||this.mode===`finished`)&&(this.audio.engineUpdate({speed01:Math.min(1.6,Math.abs(t.speed)/30),throttle:this.mode===`countdown`?this.race.playerControls.accel:t.throttle,boost:t.boostT>0,airborne:!t.grounded,offroad:!t.onRoad}),this.audio.driftUpdate(t.drift.active&&t.grounded,t.drift.level)),this._starLoop&&t.invincibleT<=0&&(this._starLoop.stop(),this._starLoop=null)}_updatePost(e){let t=this.race.player,n=this.renderer.fx,r=+(t.boostT>0&&this.mode!==`finished`);n.uBoost.value+=(r*(t.boostPower>=9?1:.7)-n.uBoost.value)*Math.min(1,e*5),n.uSpeedLines.value=n.uBoost.value,this._hitFlash=Math.max(0,(this._hitFlash||0)-e*3),n.uCA.value=.004+this._hitFlash*.03+n.uBoost.value*.01;let i=this.def.env,a=0;if((i.sky.sunDisk??0)>0&&i.flare!==!1){let e=this.world.env.sky.sunDir,t=this.camera.position;if($o.copy(t).addScaledVector(e,1e3).project(this.camera),$o.z<1&&Math.abs($o.x)<1.25&&Math.abs($o.y)<1.25){a=1-ot.smoothstep(Math.max(Math.abs($o.x),Math.abs($o.y)),.85,1.25);for(let n of[12,35,80,160,300,520])if(this.world.terrain.heightAt(t.x+e.x*n,t.z+e.z*n)>t.y+e.y*n){a=0;break}n.uSunPos.value.set($o.x*.5+.5,$o.y*.5+.5)}}this._sunVis=(this._sunVis||0)+(a-(this._sunVis||0))*Math.min(1,e*5),n.uSunVis.value=this._sunVis*(i.flareStrength??1),n.uFlareColor.value.set(i.sky.sunColor??16765088)}};function ns(e,t){let n=e.frameAt(e.length-30),r=n.pos.clone();return{from:r.clone().addScaledVector(n.right,-18).add(new I(0,7,0)).addScaledVector(n.tan,30).toArray(),to:t.pos.clone().addScaledVector(t.forward(new I),-9).add(new I(0,3.2,0)).toArray(),look:r.toArray(),lookTo:t.pos.clone().add(new I(0,1,0)).toArray(),dur:2.6,fov:58}}function rs(e,t){let n=e.bounds.getCenter(new I),r=e.bounds.getSize(new I),i=Math.max(r.x,r.z)*.55,a=e.length*.35,o=e.frameAt(a),s=o.pos.clone().addScaledVector(o.right,14).add(new I(0,5,0)),c=e.frameAt(a+60).pos.clone().addScaledVector(o.right,10).add(new I(0,4,0)),l=e.frameAt(e.length-30),u=l.pos.clone();return[{from:[n.x-i,n.y+i*.55,n.z+i],to:[n.x+i*.3,n.y+i*.45,n.z+i*.9],look:[n.x,n.y,n.z],dur:3.2,fov:50},{from:s.toArray(),to:c.toArray(),look:e.frameAt(a+30).pos.toArray(),lookTo:e.frameAt(a+90).pos.toArray(),dur:2.8,fov:55},{from:u.clone().addScaledVector(l.right,-18).add(new I(0,7,0)).addScaledVector(l.tan,30).toArray(),to:t.pos.clone().addScaledVector(t.forward(new I),-9).add(new I(0,3.2,0)).toArray(),look:u.toArray(),lookTo:t.pos.clone().add(new I(0,1,0)).toArray(),dur:2.6,fov:58}]}var is=Ga(1234),as=Ga(777),os=-.55,ss=-.85,cs=.35,ls=[150,0],us=-2.55,ds=e=>92+8*Math.sin(e/70)+4*Math.sin(e/23+1.3);function fs(e,t,n,r,i,a){let o=(e-n)*(e-n)+(t-r)*(t-r);return i*Math.exp(-o/(2*a*a))}function ps(e,t){let n=K(58,38,Math.abs(e+18))*K(-135,-105,t)*K(82,62,t),r=K(46,30,Math.hypot(e-150,t+208)),i=K(50,32,Math.hypot(e-95,t-232)),a=K(40,26,Math.hypot(e+70,t+180));return Math.max(n,r,i,a)}function ms(e,t){if(Math.abs(t)>560||Math.abs(t-ds(e))<20)return 0;let n=K(400,540,Math.abs(t));return K(7+n*16,3.2+n*3,Math.abs(e-205))}function hs(e,t){let n=ss;n=q(n,.25+Ka(is,e/60,t/60,2)*.3,ps(e,t)),n+=fs(e,t,300,5,17,58)+fs(e,t,350,60,12,45)+fs(e,t,250,-10,5,30),n+=fs(e,t,-60,-230,9,40)+fs(e,t,60,290,7,45),n+=fs(e,t,205,-630,40,75)+fs(e,t,205,630,40,75);let r=e-ls[0],i=t-ls[1],a=Math.hypot(r,i),o=.3+.7*K(.15,.6,Math.abs(((Math.atan2(i,r)-us+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI)),s=.5+.5*Ka(is,e/260,t/260,4);n+=K(430,850,a)*(18+55*s)*o,n+=K(800,1500,a)*(60+190*(.5+.5*Ka(as,e/420,t/420,4)))*o,n+=K(330,560,a)*(Ka(as,e/90,t/90,3)*5+2.5);let c=ms(e,t);c>0&&(n=q(n,cs,c));let l=Math.abs(t-ds(e)),u=-4.6+Ka(as,e/30,t/30,2)*.4,d=K(11,26,l);return n=q(Math.min(u,n),n,d),n}function gs(e,t){return Math.abs(t-ds(e))<24?-3:os}function _s(e,t,n){return n.edge<3?`dirt`:`grass`}function vs(e,t,n,r,i){let a=Ka(as,e/14,t/14,3),o=Ka(is,e/70,t/70,2),s=[.2+o*.05,.33+a*.06,.1];n<-.65&&(s=[.16,.14,.09]),n<-2.7&&(s=[.13,.12,.1]);let c=ps(e,t);if(c>.3&&(s=[q(s[0],.28+a*.05,c*.5),q(s[1],.34,c*.3),q(s[2],.13,c*.5)]),ms(e,t)>.5&&(s=[.36,.33,.3]),r<3.2){let e=K(3.2,.8,r);s=[q(s[0],.4,e),q(s[1],.33,e),q(s[2],.22,e)]}let l=K(.08,.35,i);s=[q(s[0],.24,l*.5),q(s[1],.25,l*.5),q(s[2],.13,l*.5)];let u=K(420,800,Math.hypot(e-ls[0],t-ls[1]));return s=[q(s[0],.07+o*.03,u),q(s[1],.16+a*.04,u),q(s[2],.08,u)],s}function ys(e,t){return ps(e,t)>.05||Math.abs(t-ds(e))<30||ms(e,t)>.02?!1:hs(e,t)<-.67}var bs=class{constructor(e,{scale:t=.5}={}){this.height=e,this.scale=t,this.target=new je(16,16,{type:i,samples:0}),this.target.texture.generateMipmaps=!1,this.camera=new Ce,this.camera.layers.set(0),this.textureMatrix=new xe,this.enabled=!0,this.hide=[],this._plane=new xt,this._clip=new re,this._q=new re,this._size=new F}update(e,t,n){if(!this.enabled||(this._frames=(this._frames||0)+1)<3)return;e.getDrawingBufferSize(this._size);let r=Math.max(16,Math.floor(this._size.x*this.scale)),i=Math.max(16,Math.floor(this._size.y*this.scale));(this.target.width!==r||this.target.height!==i)&&this.target.setSize(r,i);let a=this.height,o=this.camera;if(n.updateMatrixWorld(),n.position.y<a)return;o.position.copy(n.position),o.position.y=2*a-n.position.y;let s=new I(0,0,-1).applyQuaternion(n.quaternion);s.y=-s.y;let c=new I(0,1,0).applyQuaternion(n.quaternion);c.y=-c.y,o.up.copy(c),o.lookAt(o.position.clone().add(s)),o.fov=n.fov,o.aspect=n.aspect,o.near=n.near,o.far=n.far,o.updateProjectionMatrix(),o.updateMatrixWorld(),this.textureMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),this.textureMatrix.multiply(o.projectionMatrix),this.textureMatrix.multiply(o.matrixWorldInverse),this._plane.set(new I(0,1,0),-a),this._plane.applyMatrix4(o.matrixWorldInverse);let l=this._clip.set(this._plane.normal.x,this._plane.normal.y,this._plane.normal.z,this._plane.constant),u=o.projectionMatrix,d=this._q;d.x=(Math.sign(l.x)+u.elements[8])/u.elements[0],d.y=(Math.sign(l.y)+u.elements[9])/u.elements[5],d.z=-1,d.w=(1+u.elements[10])/u.elements[14],l.multiplyScalar(2/l.dot(d)),u.elements[2]=l.x,u.elements[6]=l.y,u.elements[10]=l.z+1-.003,u.elements[14]=l.w,o.projectionMatrixInverse.copy(u).invert();let f=this.hide.map(e=>e.visible);for(let e of this.hide)e.visible=!1;let p=e.getRenderTarget(),m=e.shadowMap.autoUpdate;e.shadowMap.autoUpdate=!1,la.updateCamera(o),e.setRenderTarget(this.target),e.clear(),e.render(t,o),e.setRenderTarget(p),e.shadowMap.autoUpdate=m,this.hide.forEach((e,t)=>e.visible=f[t]),la.updateCamera(n)}},xs=`
attribute float depth;
uniform mat4 uReflMatrix;
varying vec3 vWorld;
varying vec4 vRefl;
varying float vDepth;
#include <fog_pars_vertex>
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vRefl = uReflMatrix * wp;
  vDepth = depth;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`,Ss=`
uniform sampler2D tRefl;
uniform float uUseRefl;
uniform float uTime;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uSkyTop;
uniform vec3 uSkyHorizon;
uniform float uReflStrength;
uniform float uWaveAmp;
uniform float uWaveScale;
uniform float uFlow;
uniform vec2 uFlowDir;
uniform float uRows;       // rice rows pattern amount (paddies)
uniform vec3 uRowColor;
uniform float uEdgeFade;
uniform float uSpecular;
varying vec3 vWorld;
varying vec4 vRefl;
varying float vDepth;
#include <fog_pars_fragment>

float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),u.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x), u.y); }

vec2 waveGrad(vec2 p, float t) {
  vec2 g = vec2(0.0);
  vec2 q = p * uWaveScale + uFlowDir * t * uFlow;
  // a few directional sines
  vec2 d1 = normalize(vec2(1.0, 0.3)), d2 = normalize(vec2(-0.4, 1.0)), d3 = normalize(vec2(0.7, -0.8));
  float w = vn(q * 0.35 + t * 0.05); // break up regularity
  g += d1 * cos(dot(q, d1) * 1.7 + t * 1.3 + w * 6.0) * 0.22;
  g += d2 * cos(dot(q, d2) * 2.9 - t * 1.7 + w * 4.0) * 0.14;
  g += d3 * cos(dot(q, d3) * 4.3 + t * 2.3) * 0.08;
  // noise ripples (two octaves)
  float e = 0.05;
  vec2 r = q * 3.0 + vec2(t * 0.4, -t * 0.3);
  float n0 = vn(r);
  g += vec2(vn(r + vec2(e, 0.0)) - n0, vn(r + vec2(0.0, e)) - n0) / e * 0.16;
  vec2 r2 = q * 7.0 + vec2(-t * 0.7, t * 0.5);
  float m0 = vn(r2);
  g += vec2(vn(r2 + vec2(e, 0.0)) - m0, vn(r2 + vec2(0.0, e)) - m0) / e * 0.07;
  return g * uWaveAmp;
}

void main() {
  vec2 g = waveGrad(vWorld.xz, uTime);
  vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
  vec3 v = normalize(cameraPosition - vWorld);
  float ndv = max(dot(n, v), 0.0);
  float fres = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
  vec3 r = reflect(-v, n);
  vec3 refl;
  if (uUseRefl > 0.5) {
    vec2 uv = vRefl.xy / max(vRefl.w, 1e-4) + n.xz * 0.035;
    refl = texture2D(tRefl, uv).rgb;
  } else {
    float ry = max(r.y, 0.0);
    refl = mix(uSkyHorizon, uSkyTop, pow(ry, 0.5));
  }
  float dep = max(vDepth, 0.0);
  vec3 body = mix(uShallow, uDeep, smoothstep(0.0, 2.0, dep));
  float reflAmt = clamp(uReflStrength * (0.35 + 0.65 * fres), 0.0, 1.0);
  vec3 col = mix(body, refl, reflAmt);
  // rice rows (paddies): seedlings interrupt the mirror
  if (uRows > 0.0) {
    float row = abs(fract(vWorld.x * 1.6) - 0.5);
    float plant = smoothstep(0.12, 0.02, row) * (0.6 + 0.4 * vn(vWorld.xz * 2.3));
    float dist = length(cameraPosition - vWorld);
    plant *= smoothstep(25.0, 60.0, dist) * uRows; // near: real 3D plants
    col = mix(col, uRowColor, plant * 0.75);
  }
  // sun glitter
  vec3 hv = normalize(uSunDir + v);
  float spec = pow(max(dot(n, hv), 0.0), 350.0) * 6.0 + pow(max(dot(n, hv), 0.0), 40.0) * 0.12;
  col += uSunColor * spec * uSpecular;
  float alpha = uEdgeFade > 0.0 ? smoothstep(0.0, uEdgeFade, dep) : 1.0;
  gl_FragColor = vec4(col, alpha);
  #include <fog_fragment>
}
`;function Cs(e={}){let t=e=>new B(e),n=new P({uniforms:fe.merge([G.fog,{tRefl:{value:null},uReflMatrix:{value:new xe},uUseRefl:{value:0},uTime:{value:0},uSunDir:{value:new I(0,1,0)},uSunColor:{value:t(e.sunColor??16769200)},uDeep:{value:t(e.deep??1454650)},uShallow:{value:t(e.shallow??3820090)},uSkyTop:{value:t(e.skyTop??5601194)},uSkyHorizon:{value:t(e.skyHorizon??16760976)},uReflStrength:{value:e.reflStrength??.9},uWaveAmp:{value:e.waveAmp??.08},uWaveScale:{value:e.waveScale??.9},uFlow:{value:e.flow??0},uFlowDir:{value:new F(...e.flowDir||[1,0])},uRows:{value:e.rows??0},uRowColor:{value:t(e.rowColor??5208618)},uEdgeFade:{value:e.edgeFade??.12},uSpecular:{value:e.specular??1}}]),vertexShader:xs,fragmentShader:Ss,transparent:!0,depthWrite:!1,fog:!0});return Object.assign(n.uniforms,la.uniforms()),n}function ws(e,t,{minX:n,maxX:r,minZ:i,maxZ:a,cell:o=4,include:s=null,material:c}){let l=Math.ceil((r-n)/o)+1,u=Math.ceil((a-i)/o)+1,d=[],f=[],p=[],m=new Int32Array(l*u).fill(-1),h=new Float32Array(l*u),g=new Uint8Array(l*u);for(let t=0;t<u;t++)for(let r=0;r<l;r++){let a=n+r*o,c=i+t*o,u=e.heightAt(a,c);h[t*l+r]=u,g[t*l+r]=s?+!!s(a,c):1}let _=(e,r)=>{let a=r*l+e;return m[a]>=0?m[a]:(m[a]=d.length/3,d.push(n+e*o,t,i+r*o),f.push(t-h[a]),m[a])};for(let e=0;e<u-1;e++)for(let n=0;n<l-1;n++){let r=[e*l+n,e*l+n+1,(e+1)*l+n,(e+1)*l+n+1],i=!1,a=!0;for(let e of r)h[e]<t-.02&&(i=!0),g[e]||(a=!1);if(!i||!a)continue;let o=_(n,e),s=_(n+1,e),c=_(n,e+1),u=_(n+1,e+1);p.push(o,c,s,s,c,u)}let v=new we;v.setAttribute(`position`,new M(d,3)),v.setAttribute(`depth`,new M(f,1)),v.setIndex(p),v.computeBoundingSphere();let y=new U(v,c);return y.renderOrder=1,y.name=`water`,y}var Ts=class{constructor(e,t,n,{reflection:r=!0,reflectionHeight:i=0,reflectionScale:a=.5}={}){this.renderer=e,this.scene=t,this.materials=[],this.meshes=[],this.sunDir=n,this.reflection=r?new bs(i,{scale:a}):null,this.time=0}add(e,{reflect:t=!1}={}){this.scene.add(e),this.meshes.push(e);let n=e.material;return this.materials.includes(n)||this.materials.push(n),n.uniforms.uSunDir.value.copy(this.sunDir),t&&this.reflection&&(n.uniforms.tRefl.value=this.reflection.target.texture,n.uniforms.uReflMatrix.value=this.reflection.textureMatrix,n.uniforms.uUseRefl.value=1),this.reflection&&this.reflection.hide.push(e),e}beforeRender(e,t){this.reflection&&this.reflection.update(e,this.scene,t)}update(e){this.time+=e;for(let e of this.materials)e.uniforms.uTime.value=this.time}dispose(){this.reflection&&this.reflection.target.dispose();for(let e of this.materials)e.dispose()}},Es={value:0};function Ds(e,{amp:t=.35,key:n=`wind`}={}){let r=new R(e);return r.onBeforeCompile=e=>{e.uniforms.uTime=Es,e.uniforms.uWindAmp={value:t},e.vertexShader=`uniform float uTime;
uniform float uWindAmp;
`+e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
      #ifdef USE_INSTANCING
        vec3 wIp = instanceMatrix[3].xyz;
        mat3 wIm = mat3(instanceMatrix);
      #else
        vec3 wIp = vec3(0.0);
        mat3 wIm = mat3(1.0);
      #endif
      vec3 wWp = (modelMatrix * vec4(wIp, 1.0)).xyz;
      float wHgt = max(position.y, 0.0);
      float wBend = wHgt * wHgt * uWindAmp;
      float wPh = uTime * 1.9 + wWp.x * 0.23 + wWp.z * 0.19;
      float wGust = 0.55 + 0.45 * sin(uTime * 0.7 + wWp.x * 0.025 + wWp.z * 0.02);
      vec3 wDir = vec3(0.8, 0.0, 0.35) * (sin(wPh) * 0.55 + 0.45) * wGust + vec3(0.0, 0.0, 0.25) * cos(wPh * 1.3);
      float wS2 = max(dot(wIm[0], wIm[0]), 1e-4);
      vec3 wLocal = vec3(dot(wIm[0], wDir), dot(wIm[1], wDir), dot(wIm[2], wDir)) / wS2;
      transformed += wLocal * wBend;`)},r.customProgramCacheKey=()=>n+t,r}function Os({blades:e=7,height:t=.45,spread:n=.12,width:r=.035,seed:i=1,colorBase:a=[.18,.3,.08],colorTip:o=[.55,.72,.25],lean:s=.25}={}){let c=i,l=()=>(c=c*16807%2147483647)/2147483647,u=[],d=[],f=[];for(let i=0;i<e;i++){let e=l()*Math.PI*2,i=t*(.65+l()*.5),c=Math.cos(e)*n*l(),p=Math.sin(e)*n*l(),m=Math.cos(e)*s*i,h=Math.sin(e)*s*i,g=-Math.sin(e)*r,_=Math.cos(e)*r,v=c+m*.45,y=p+h*.45,b=[[c-g,0,p-_],[c+g,0,p+_],[v+g*.7,i*.55,y+_*.7],[v-g*.7,i*.55,y-_*.7],[c+m,i,p+h]],x=(t,n,r)=>{for(let s of[t,n,r]){u.push(...b[s]);let t=b[s][1]/i;d.push(a[0]+(o[0]-a[0])*t,a[1]+(o[1]-a[1])*t,a[2]+(o[2]-a[2])*t),f.push(Math.cos(e)*.3,.9,Math.sin(e)*.3)}};x(0,1,2),x(0,2,3),x(3,2,4)}let p=new we;return p.setAttribute(`position`,new M(u,3)),p.setAttribute(`normal`,new M(f,3)),p.setAttribute(`color`,new M(d,3)),p}function ks(e,t,n,r=.06,i=3){let a=i,o=()=>(a=a*16807%2147483647)/2147483647,s=[];for(let i=0;i<t;i++){let a=e.clone();a.rotateY(o()*Math.PI*2);let c=.85+o()*.3;a.scale(c,c*(.9+o()*.2),c),a.translate((i-(t-1)/2)*n+(o()-.5)*r,0,(o()-.5)*r),s.push(a)}return As(s)}function As(e){let t=[`position`,`normal`,`color`],n=new we;for(let r of t){if(!e[0].attributes[r])continue;let t=e.reduce((e,t)=>e+t.attributes[r].array.length,0),i=new Float32Array(t),a=0;for(let t of e)i.set(t.attributes[r].array,a),a+=t.attributes[r].array.length;n.setAttribute(r,new st(i,e[0].attributes[r].itemSize))}return n}var js=class{constructor(e,t,{chunk:r=40,maxDist:i=90,layer:a=1,castShadow:o=!1,receiveShadow:s=!0,name:c=`scatter`}={}){this.geometry=e,this.material=t,this.chunk=r,this.maxDist=i,this.layer=a,this.castShadow=o,this.receiveShadow=s,this.name=c,this.buckets=new Map,this.meshes=[],this.count=0,this._m=new xe,this._q=new p,this._e=new n,this._p=new I,this._s=new I}add(e,t,n,r=0,i=1,a=null){let o=`${Math.floor(e/this.chunk)},${Math.floor(n/this.chunk)}`,s=this.buckets.get(o);s||this.buckets.set(o,s=[]),this._q.setFromEuler(this._e.set(0,r,0)),this._m.compose(this._p.set(e,t,n),this._q,this._s.set(i,a??i,i)),s.push(this._m.clone()),this.count++}build(e){this.group=new W,this.group.name=this.name;for(let[e,t]of this.buckets){let n=new g(this.geometry,this.material,t.length);for(let e=0;e<t.length;e++)n.setMatrixAt(e,t[e]);n.instanceMatrix.needsUpdate=!0,n.computeBoundingSphere(),n.castShadow=this.castShadow,n.receiveShadow=this.receiveShadow,n.layers.set(this.layer),n.matrixAutoUpdate=!1;let[r,i]=e.split(`,`).map(Number);n.userData.center=new I((r+.5)*this.chunk,0,(i+.5)*this.chunk),this.meshes.push(n),this.group.add(n)}return this.buckets.clear(),e.add(this.group),this.group}update(e){let t=e.position.x,n=e.position.z,r=this.maxDist+this.chunk*.71;for(let e of this.meshes){let i=e.userData.center,a=i.x-t,o=i.z-n;e.visible=a*a+o*o<r*r}}},Ms=new xe,Ns=new xe;function Ps(e){e.updateMatrixWorld(!0),Ns.copy(e.matrixWorld).invert();let t=new Map;e.traverse(e=>{if(!e.isMesh||!e.geometry||e.isInstancedMesh||e.isSkinnedMesh||e.visible===!1)return;let n=Array.isArray(e.material)?e.material:[e.material],r=e.geometry;if(Ms.multiplyMatrices(Ns,e.matrixWorld),Array.isArray(e.material)&&r.groups.length){for(let i of r.groups){let a=n[i.materialIndex],o=Is(r,i);Fs(t,a,o.applyMatrix4(Ms),e)}return}Fs(t,n[0],r.clone().applyMatrix4(Ms),e)});let n=[];for(let[e,r]of t){let t=Ls(r.geos),i=t.length===1?t[0]:ut(t,!1);if(!i){console.warn(`[Instancer] merge failed for material`,e.name);continue}i.computeBoundingSphere(),n.push({material:e,geometry:i,cast:r.cast>0,receive:r.receive>0})}return n}function Fs(e,t,n,r){let i=e.get(t);i||e.set(t,i={geos:[],cast:0,receive:0}),i.geos.push(n),r.castShadow&&i.cast++,r.receiveShadow&&i.receive++}function Is(e,t){let n=e.index?e.toNonIndexed():e.clone(),r=(e.index,t.start),i=t.count,a=new we;for(let e of Object.keys(n.attributes)){let t=n.attributes[e];a.setAttribute(e,new st(t.array.slice(r*t.itemSize,(r+i)*t.itemSize),t.itemSize))}return a}function Ls(e){let t=e.some(e=>e.attributes.color),n=t?Math.max(...e.map(e=>e.attributes.color?e.attributes.color.itemSize:3)):3;return e.map(e=>{let r=e.index?e.toNonIndexed():e,i=r.attributes.position.count;r.attributes.normal||r.computeVertexNormals(),r.attributes.uv||r.setAttribute(`uv`,new st(new Float32Array(i*2),2));let a=new Set([`position`,`normal`,`uv`]);if(t){a.add(`color`);let e=r.attributes.color;if(!e||e.itemSize!==n||e.normalized||!(e.array instanceof Float32Array)){let t=new Float32Array(i*n).fill(1);if(e)for(let r=0;r<i;r++)t[r*n]=e.getX(r),t[r*n+1]=e.getY(r),t[r*n+2]=e.getZ(r),n===4&&(t[r*n+3]=e.itemSize===4?e.getW(r):1);r.setAttribute(`color`,new st(t,n))}}for(let e of Object.keys(r.attributes))a.has(e)||r.deleteAttribute(e);return r.morphAttributes={},r})}var Rs=class{constructor({chunk:e=160}={}){this.chunk=e,this.protos=new Map,this.group=new W,this.group.name=`props`,this.colliders=[]}add(e,t,{x:n,y:r,z:i,rotY:a=0,scale:o=1,collide:s=!0}){let c=this.protos.get(e);if(!c){let n;try{n=t()}catch(t){console.warn(`[Instancer] prop factory failed:`,e,t),n=null}n&&!n.isObject3D&&(n=n.group||n.root||null),c={parts:n?Ps(n):[],placements:[],collider:n&&n.userData?n.userData.collider:null},this.protos.set(e,c)}if(c.placements.push({x:n,y:r,z:i,rotY:a,scale:o}),s&&c.collider){let e=c.collider;e.type===`circle`?this.colliders.push({x:n,z:i,r:e.r*o}):e.type===`box`&&this.colliders.push({x:n,z:i,r:Math.max(e.w,e.d)*.5*o*.9})}return this}build(e){let t=new p,r=new n,i=new I,a=new I;for(let[e,n]of this.protos){if(!n.parts.length)continue;let o=new Map;for(let e of n.placements){let t=`${Math.floor(e.x/this.chunk)},${Math.floor(e.z/this.chunk)}`,n=o.get(t);n||o.set(t,n=[]),n.push(e)}for(let[,s]of o)for(let o of n.parts){let n=new g(o.geometry,o.material,s.length);s.forEach((e,o)=>{t.setFromEuler(r.set(0,e.rotY,0)),Ms.compose(i.set(e.x,e.y,e.z),t,a.setScalar(e.scale)),n.setMatrixAt(o,Ms)}),n.instanceMatrix.needsUpdate=!0,n.computeBoundingSphere(),n.castShadow=o.cast,n.receiveShadow=o.receive,n.matrixAutoUpdate=!1,n.name=e,this.group.add(n)}}return e.add(this.group),this.group}},zs=`
varying vec3 vN;
varying vec3 vW;
varying float vH;
uniform float uHeight;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vH = position.y / uHeight;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Bs=`
uniform vec3 uColor;
uniform vec3 uSnow;
uniform vec3 uHaze;
uniform float uHazeAmt;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uAmbient;
uniform float uSnowLine;
varying vec3 vN;
varying vec3 vW;
varying float vH;
float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
void main() {
  vec3 n = normalize(vN);
  float ang = atan(vW.z, vW.x);
  float streak = sin(ang * 60.0) * 0.5 + sin(ang * 23.0 + 1.3) * 0.3 + (h21(vec2(floor(ang * 90.0), 1.0)) - 0.5) * 0.4;
  float snow = smoothstep(uSnowLine - 0.04, uSnowLine + 0.02, vH + streak * 0.07 * (1.0 - vH));
  vec3 base = mix(uColor, uSnow, snow);
  float diff = max(dot(n, uSunDir), 0.0);
  // snow catches plenty of sky light even when backlit
  vec3 col = base * (uAmbient * (1.0 + snow * 1.6) + uSunColor * diff);
  // rim light toward the sun (backlit silhouettes glow)
  col += uSunColor * pow(1.0 - max(n.y, 0.0), 3.0) * 0.05;
  col = mix(col, uHaze, uHazeAmt * (1.0 - vH * 0.35));
  gl_FragColor = vec4(col, 1.0);
}
`;function Vs(e={}){let t=e.height??1100,n=e.radius??3e3,r=[];for(let e=0;e<=40;e++){let i=e/40,a=.035*n+(n-.035*n)*i**1.9,o=t*(1-i**.85);r.push(new F(a,o))}r.unshift(new F(0,t*.985));let i=new rt(r,96),a=Ga(77),o=i.attributes.position;for(let e=0;e<o.count;e++){let n=o.getX(e),r=o.getY(e),i=o.getZ(e),s=Math.atan2(i,n),c=1+Ka(a,Math.cos(s)*3+r/t*2,Math.sin(s)*3,3)*.06*(1-r/t);o.setXYZ(e,n*c,r,i*c)}i.computeVertexNormals();let s=new P({uniforms:{uHeight:{value:t},uColor:{value:new B(e.color??4871792)},uSnow:{value:new B(e.snowColor??16052991)},uHaze:{value:new B(e.haze??13215920)},uHazeAmt:{value:e.hazeAmt??.55},uSunDir:{value:new I(...e.sunDir||[0,1,0]).normalize()},uSunColor:{value:new B(e.sunColor??16760960)},uAmbient:{value:new B(e.ambient??6974088)},uSnowLine:{value:e.snowLine??.7}},vertexShader:zs,fragmentShader:Bs,fog:!1}),c=new U(i,s);return c.name=`fuji`,c.frustumCulled=!1,c}function Hs(e={}){let t=new W,n=e.layers??3,r=Ga(e.seed??5);for(let i=0;i<n;i++){let n=(e.radius??2600)+i*(e.step??500),a=[],o=[];for(let t=0;t<=256;t++){let o=t/256*Math.PI*2,s=Ka(r,Math.cos(o)*(2.5+i),Math.sin(o)*(2.5+i)+i*7,5)*.5+.5,c=(e.minH??120)+s*(e.maxH??380)*(1+i*.35);if(e.gap){let t=Math.abs(((o-e.gap.angle+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI);c*=.25+.75*Math.min(1,t/e.gap.width)}let l=Math.cos(o)*n,u=Math.sin(o)*n;a.push(l,-40,u,l,c,u)}for(let e=0;e<256;e++){let t=e*2,n=t+1,r=t+2,i=t+3;o.push(t,r,n,n,r,i)}let s=new we;s.setAttribute(`position`,new M(a,3)),s.setIndex(o),s.computeVertexNormals();let c=(e.hazeBase??.45)+i*(e.hazeStep??.15),l=new P({uniforms:{uHaze:{value:new B(e.haze??12100792)},uColor:{value:new B(e.color??4016734)},uHazeAmt:{value:Math.min(.95,c)},uTop:{value:new B(e.topColor??e.haze??12100792)}},vertexShader:`varying float vY; void main(){ vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);} `,fragmentShader:`uniform vec3 uHaze; uniform vec3 uColor; uniform float uHazeAmt; uniform vec3 uTop; varying float vY;
        void main(){ float t = clamp(vY / 500.0, 0.0, 1.0); vec3 c = mix(uColor, uTop, t * 0.25); c = mix(c, uHaze, uHazeAmt + (1.0 - t) * 0.2); gl_FragColor = vec4(c, 1.0);} `,side:2,fog:!1}),u=new U(s,l);u.frustumCulled=!1,u.renderOrder=-500+i,t.add(u)}return t}function Us(e=1){let t=e>>>0||1;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function Ws(e,t,n,r,i,a,o){let s=n-t;s<0&&(s+=e.length);let c=Math.max(1,Math.floor(s/r));for(let n=0;n<=c;n++){let r=t+s*n/c,l=e.frameAt(r),u=i*(l.width+a);o(l.pos.clone().addScaledVector(l.right,u),l,e.wrapS(r),u)}}var Gs=class{constructor(e=12){this.cell=e,this.map=new Map}add(e,t,n){let r=this.key(Math.floor(e/this.cell),Math.floor(t/this.cell)),i=this.map.get(r);i||this.map.set(r,i=[]),i.push({x:e,z:t,r:n})}key(e,t){return e*73856093^t*19349663}resolve(e,t){let n=Math.floor(e.x/this.cell),r=Math.floor(e.z/this.cell),i=null;for(let a=n-1;a<=n+1;a++)for(let n=r-1;n<=r+1;n++){let r=this.map.get(this.key(a,n));if(r)for(let n of r){let r=e.x-n.x,a=e.z-n.z,o=t+n.r,s=r*r+a*a;if(s<o*o&&s>1e-8){let t=Math.sqrt(s),n=o-t;e.x+=r/t*n,e.z+=a/t*n,(!i||n>i.pen)&&(i={nx:r/t,nz:a/t,pen:n})}}}return i}};function Ks(e=1){let t=document.createElement(`canvas`);t.width=256,t.height=128;let n=t.getContext(`2d`);n.fillStyle=`#f2c12e`,n.fillRect(0,0,256,128),n.fillStyle=`#1c1c1e`;for(let t=0;t<3;t++){let r=40+t*70;n.beginPath(),e>0?(n.moveTo(r,20),n.lineTo(r+40,64),n.lineTo(r,108),n.lineTo(r+22,108),n.lineTo(r+62,64),n.lineTo(r+22,20)):(n.moveTo(r+62,20),n.lineTo(r+22,64),n.lineTo(r+62,108),n.lineTo(r+40,108),n.lineTo(r,64),n.lineTo(r+40,20)),n.closePath(),n.fill()}n.strokeStyle=`#1c1c1e`,n.lineWidth=8,n.strokeRect(4,4,248,120);let r=new ft(t);return r.colorSpace=oe,r.anisotropy=8,r}function qs(e=1){let t=new W,n=new U(new Qe(2.4,1.2,.08),[new R({color:3355443}),new R({color:3355443}),new R({color:3355443}),new R({color:3355443}),new R({map:Ks(e),roughness:.5}),new R({color:10132122,roughness:.6})]);n.position.y=1.5,n.castShadow=!0,t.add(n);let r=new R({color:9080209,metalness:.7,roughness:.4});for(let e of[-.8,.8]){let n=new U(new bt(.05,.05,1.6,8),r);n.position.set(e,.8,-.06),n.castShadow=!0,t.add(n)}return t}var Js=`modulepreload`,Ys=function(e,t){return new URL(e,t).href},Xs={},Zs=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=Ys(t,n),t=s(t),t in Xs)return;Xs[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:Js,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},Qs=(e,t)=>e&&typeof e[t]==`function`,J={},$s={};async function ec(e){J=await Zs(()=>import(`./rural-D_WNArV8.js`),__vite__mapDeps([0,1,2]),import.meta.url).catch(e=>(console.warn(`rural props unavailable`,e),{})),$s=await Zs(()=>import(`./shrine-XOlbh7ba.js`),__vite__mapDeps([3,1,2]),import.meta.url).catch(e=>(console.warn(`shrine props unavailable`,e),{}));let{scene:t,track:n,terrain:r,world:i,renderer:a}=e,o=i.env.sky.sunDir.clone(),s=[],c=Us(2024),l=new Gs(12);i.colliders=l;let u=n,d=u.length,f=new URLSearchParams(location.search),m={},h=performance.now(),g=e=>{let t=performance.now();console.log(`[build] ${e} ${(t-h).toFixed(0)}ms`),h=t},_=new Ts(a.renderer,t,o,{reflection:i.quality!==`low`,reflectionHeight:os,reflectionScale:.5}),v=Cs({deep:2763298,shallow:4867120,skyTop:5929136,skyHorizon:16757370,sunColor:16763024,reflStrength:.92,waveAmp:.05,waveScale:1.3,rows:1,rowColor:5799212,edgeFade:.1,specular:1.2}),y=u.bounds,b=ws(r,os,{minX:y.min.x-420,maxX:y.max.x+420,minZ:y.min.z-420,maxZ:y.max.z+420,cell:4,include:(e,t)=>Math.abs(t-ds(e))>22,material:v});_.add(b,{reflect:!0});let x=Cs({deep:1915716,shallow:4481103,skyTop:5929136,skyHorizon:16757370,sunColor:16763024,reflStrength:.75,waveAmp:.14,waveScale:.6,flow:.9,flowDir:[1,.1],rows:0,edgeFade:.25,specular:1}),S=ws(r,-3,{minX:y.min.x-700,maxX:y.max.x+700,minZ:20,maxZ:170,cell:3,include:(e,t)=>Math.abs(t-ds(e))<30,material:x});if(_.add(S),s.push(e=>_.update(e)),i.beforeRender=(e,t)=>_.beforeRender(e,t),i.water=_,g(`water`),!f.get(`noveg`)){let e=Ds({vertexColors:!0,roughness:.75,side:2},{amp:.5,key:`rice`}),n=Os({blades:5,height:.42,spread:.05,width:.022,lean:.35,colorBase:[.16,.28,.06],colorTip:[.5,.75,.22],seed:11});n.translate(0,os-ss-.05,0);let i=new js(ks(n,5,.46,.05,7),e,{chunk:32,maxDist:75,name:`rice`}),a=new Qe(1,1,1);a.translate(0,.5,0);let o=new js(a,new R({color:6122035,roughness:1}),{chunk:64,maxDist:400,layer:0,receiveShadow:!0,name:`ridges`}),l=os+.14-ss,f=Math.floor((y.min.x-260)/28)*28,h=y.max.x+260,_=Math.floor((y.min.z-260)/19)*19,v=y.max.z+260;for(let e=_;e<v;e+=19)for(let t=f;t<h;t+=28){let n=t+14,a=e+19/2;if(!ys(n,a))continue;let o=r.sample(n,a,m);if(o.edge<3)continue;let s=o.edge<80;if(!(c()<.12)&&s){if((c()<.5?0:Math.PI/2)==0)for(let n=e+.9;n<e+19-.6;n+=.62)for(let e=t+1.6;e<t+28-1.4;e+=2.3)ys(e,n)&&(r.sample(e,n,m).edge<2.2||i.add(e,ss,n,c()<.5?0:Math.PI,.9+c()*.25));else for(let n=t+.9;n<t+28-.6;n+=.62)for(let t=e+1.6;t<e+19-1.4;t+=2.3)ys(n,t)&&(r.sample(n,t,m).edge<2.2||i.add(n,ss,t,Math.PI/2+(c()<.5?0:Math.PI),.9+c()*.25))}}let b=(e,t,n,i)=>{let a=Math.hypot(n-e,i-t),s=Math.ceil(a/2),c=-1;for(let a=0;a<=s;a++){let u=a/s,d=e+(n-e)*u,f=t+(i-t)*u,h=a<s&&ys(d,f)&&r.sample(d,f,m).edge>1.5;if(h&&c<0&&(c=a),(!h||a===s)&&c>=0){let r=c/s,u=a/s,d=e+(n-e)*r,f=t+(i-t)*r,m=e+(n-e)*u,h=t+(i-t)*u,g=Math.hypot(m-d,h-f);if(g>1.5){let r=new xe,a=Math.abs(n-e)>Math.abs(i-t);r.compose(new I((d+m)/2,ss,(f+h)/2),new p,a?new I(g,l,.55):new I(.55,l,g));let s=`${Math.floor(r.elements[12]/o.chunk)},${Math.floor(r.elements[14]/o.chunk)}`,c=o.buckets.get(s);c||o.buckets.set(s,c=[]),c.push(r)}c=-1}}};for(let e=_;e<=v;e+=19)b(f,e,h,e);for(let e=f;e<=h;e+=28)b(e,_,e,v);i.build(t),o.build(t),s.push((e,t,n)=>{n&&n.camera&&i.update(n.camera)});let x=Ds({vertexColors:!0,roughness:.85,side:2},{amp:.6,key:`grass`}),S=new js(Os({blades:14,height:.42,spread:.26,width:.018,lean:.55,colorBase:[.13,.22,.06],colorTip:[.45,.6,.2],seed:5}),x,{chunk:40,maxDist:110,name:`grass`});Os({blades:5,height:.5,spread:.1,width:.025,lean:.25,colorBase:[.15,.25,.08],colorTip:[.4,.55,.2],seed:9});for(let e=0;e<d;e+=.8){let t=u.frameAt(e);if(!u.inGap(e))for(let e of[-1,1])for(let n=0;n<2;n++){let n=.3+c()*4.5,i=e*(t.width+n),a=t.pos.clone().addScaledVector(t.right,i);a.x+=(c()-.5)*.8,a.z+=(c()-.5)*.8;let o=r.sample(a.x,a.z,m);o.h<-.5||S.add(a.x,o.h-.02,a.z,c()*6.28,.7+c()*.7)}}for(let e=0;e<26e3;e++){let e=y.min.x-140+c()*(y.max.x-y.min.x+280),t=y.min.z-140+c()*(y.max.z-y.min.z+280),n=r.sample(e,t,m);n.h<-.55+.12||n.edge<.5||S.add(e,n.h-.02,t,c()*6.28,.6+c()*.9)}S.build(t),s.push((e,t,n)=>{n&&n.camera&&S.update(n.camera)}),g(`vegetation rice=${i.meshes.reduce((e,t)=>e+t.count,0)} grass=${S.meshes.reduce((e,t)=>e+t.count,0)}`)}let C=new Rs({chunk:180}),w=(e,t)=>r.heightAt(e,t),T=(e,t,n,r,i=0,a=1,o={})=>{let s=o.y??w(n,r);C.add(e,t,{x:n,y:s,z:r,rotY:i,scale:a,collide:o.collide??!0})},E=(e,t)=>Math.atan2(-e.right.x*t,-e.right.z*t),D=e=>Math.atan2(e.tan.x,e.tan.z);if(Qs($s,`createTorii`)){let e=u.frameAt(0);T(`startTorii`,()=>$s.createTorii({style:`myojin`,material:`vermilion`,height:11.5,span:23.5,plaque:`ぽんぽこ`,seed:3}),e.pos.x,e.pos.z,D(e),1,{y:e.pos.y-.2,collide:!1});for(let t of[-1,1]){let n=e.pos.clone().addScaledVector(e.right,t*11.75);l.add(n.x,n.z,.8)}}let O=d-45,k=[],A=[],ee=[[`tile`,e=>J.createTileHouse({seed:e,lit:!1})],[`thatch`,e=>J.createThatchedHouse({seed:e})],[`kura`,e=>J.createKura({seed:e})]],te=0;Ws(u,O,135,24,1,16,(e,t,n)=>A.push({p:e,fr:t,s:n})),Ws(u,O+10,135,26,-1,16,(e,t,n)=>k.push({p:e,fr:t,s:n}));for(let[e,t]of[[k,-1],[A,1]])for(let n of e){if(Math.abs(u.deltaS(n.s,0))<14)continue;let[e,r]=ee[te%ee.length];te++;let i=10+te;if(!Qs(J,e===`tile`?`createTileHouse`:e===`thatch`?`createThatchedHouse`:`createKura`))continue;let a=e===`thatch`?7:4,o=n.p.clone().addScaledVector(n.fr.right,t*a);T(`${e}${i%4}`,()=>r(i%4),o.x,o.z,E(n.fr,t),1)}u.zones.walls=u.zones.walls||[];for(let e=0;e<u.count;e++){let t=e*u.ds;u.forwardDist(O,t)<u.forwardDist(O,135)&&(u.wallL[e]=Math.min(u.wallL[e],u.w[e]+5.2),u.wallR[e]=Math.min(u.wallR[e],u.w[e]+5.2))}if(Qs($s,`createStoneWall`))for(let e of[-1,1])Ws(u,O,135,8,e,5.5,(t,n,r)=>{Math.abs(u.deltaS(r,0))<16||T(`stoneWall`,()=>$s.createStoneWall({length:8,height:.9,seed:4}),t.x,t.z,E(n,e),1,{collide:!1})});if(Qs(J,`createUtilityPole`)){let e=[{s0:O,s1:135,side:1,off:3.2,spacing:32},{s0:150,s1:470,side:1,off:3.6,spacing:36},{s0:900,s1:1030,side:-1,off:3.6,spacing:36}];for(let n of e){let e=[];Ws(u,n.s0,n.s1,n.spacing,n.side,n.off,(t,n)=>{let r=w(t.x,t.z),i=D(n)+Math.PI/2;T(`pole`+(e.length%3==0?`T`:``),()=>J.createUtilityPole({seed:2,transformer:e.length%3==0}),t.x,t.z,i,1,{y:r}),e.push({p:new I(t.x,r,t.z),yaw:i})});let r=J.createUtilityPole({seed:2}),i=r.userData&&r.userData.wireAnchors||[new I(0,9,0)],a=new W;for(let t=0;t+1<e.length;t++){let n=e[t],r=e[t+1];for(let e of i){let t=e.clone().applyAxisAngle(new I(0,1,0),n.yaw).add(n.p),i=e.clone().applyAxisAngle(new I(0,1,0),r.yaw).add(r.p);Qs(J,`createWireSpan`)&&a.add(J.createWireSpan(t,i,{sag:.7}))}}if(a.children.length){a.updateMatrixWorld(!0);let e=[],n=null;a.traverse(t=>{if(!t.isMesh)return;n||=t.material;let r=t.geometry.index?t.geometry.toNonIndexed():t.geometry.clone();for(let e of Object.keys(r.attributes))[`position`,`normal`].includes(e)||r.deleteAttribute(e);e.push(r.applyMatrix4(t.matrixWorld))});let r=ut(e,!1);if(r){let e=new U(r,n);e.name=`wires`,t.add(e)}}}}let j=(e,t,n,r,i,a=0,o=!0)=>{let s=u.frameAt(n),c=s.pos.clone().addScaledVector(s.right,r*(s.width+i));T(e,t,c.x,c.z,E(s,r)+a,1,{collide:o})};Qs(J,`createVendingMachine`)&&(j(`vend0`,()=>J.createVendingMachine({seed:1,lit:!0}),34,-1,3.2),j(`vend1`,()=>J.createVendingMachine({seed:2,lit:!0}),35.3,-1,3.2),j(`vend2`,()=>J.createVendingMachine({seed:3,lit:!0}),610,1,3.4)),Qs(J,`createBusStop`)&&j(`busstop`,()=>J.createBusStop({seed:1,name:`たんぼ前`}),78,1,3),Qs(J,`createJizo`)&&(j(`jizo6`,()=>J.createJizo({count:6,seed:2}),112,-1,3.2),j(`jizo1`,()=>J.createJizo({count:1,seed:5}),700,-1,3)),Qs(J,`createTobidashiBoya`)&&(j(`tobidashi`,()=>J.createTobidashiBoya({seed:1}),58,1,1.8,0,!1),j(`tobidashi`,()=>J.createTobidashiBoya({seed:1}),d-30,-1,1.8,0,!1),j(`tobidashi`,()=>J.createTobidashiBoya({seed:1}),930,1,2.2,0,!1)),Qs(J,`createHokora`)&&(j(`hokora`,()=>J.createHokora({seed:3}),128,1,3.5),j(`hokora`,()=>J.createHokora({seed:3}),560,-1,4)),Qs(J,`createIdo`)&&j(`ido`,()=>J.createIdo({seed:1}),20,1,12);let M=(e,t,n,r)=>{Qs(J,`createThatchedHouse`)&&T(`thatch`+r%4,()=>J.createThatchedHouse({seed:r%4}),e,t,n)};if(M(140,-212,.2,1),M(166,-195,-.4,2),M(88,230,Math.PI+.3,3),M(108,250,Math.PI-.2,0),M(-78,-184,.9,2),Qs(J,`createKura`)&&(T(`kura1`,()=>J.createKura({seed:1}),128,-198,.2),T(`kura2`,()=>J.createKura({seed:2}),72,236,Math.PI)),Qs(J,`createKeiTruck`)&&(T(`kei0`,()=>J.createKeiTruck({seed:1}),152,-182,1.2),T(`kei1`,()=>J.createKeiTruck({seed:2}),96,213,-.4)),Qs(J,`createHazakake`)){for(let e=0;e<5;e++)T(`haza`,()=>J.createHazakake({length:8,seed:3}),110+e*11,-172,0);for(let e=0;e<4;e++)T(`haza`,()=>J.createHazakake({length:8,seed:3}),60+e*10,205,.05)}if(Qs(J,`createScarecrow`)){let e=0;for(let t=0;t<400&&e<16;t++){let t=y.min.x-60+c()*(y.max.x-y.min.x+120),n=y.min.z-60+c()*(y.max.z-y.min.z+120);if(!ys(t,n))continue;let i=r.sample(t,n,m).edge;i<8||i>60||(T(`scare`+e%3,()=>J.createScarecrow({seed:e%3}),t,n,c()*6.28,1,{y:ss,collide:!1}),e++)}}let N=(e,t,n=6)=>{let i=r.sample(e,t,m);return i.edge>n&&i.h>-.55+.2};if(Qs(J,`createCedar`)){let e=0;for(let t=0;t<3e3&&e<170;t++){let t=180+c()*260,n=-110+c()*230,i=r.sample(t,n,m);i.h<2.5||i.edge<7||Math.abs(n-ds(t))<30||(T(`cedar`+e%4,()=>J.createCedar({seed:e%4}),t,n,c()*6.28,.8+c()*.45),e++)}for(let[e,t,n]of[[205,-600,60],[205,610,60],[-60,-230,30],[60,290,30]])for(let r=0;r<n;r++){let n=c()*6.28,i=Math.sqrt(c())*70,a=e+Math.cos(n)*i,o=t+Math.sin(n)*i;N(a,o,8)&&(Math.abs(a-205)<8||T(`cedar`+r%4,()=>J.createCedar({seed:r%4}),a,o,c()*6.28,.8+c()*.5))}}if(Qs(J,`createBambooClump`))for(let[e,t]of[[258,-40],[345,20],[360,-30],[205,30],[-55,-140],[30,262],[150,-232],[-40,95]])N(e,t,6)&&T(`bamboo`+Math.abs(Math.round(e))%3,()=>J.createBambooClump({seed:Math.abs(Math.round(e))%3}),e,t,c()*6.28);if(Qs(J,`createPersimmonTree`))for(let[e,t]of[[-40,-30],[-45,20],[34,-60],[30,50],[155,-175],[120,-225],[100,222],[82,262],[190,182],[-80,-160]])N(e,t,5)&&T(`kaki`+Math.abs(Math.round(t))%3,()=>J.createPersimmonTree({seed:Math.abs(Math.round(t))%3}),e,t,c()*6.28,.9+c()*.3);if(Qs(J,`createBroadleafTree`)){let e=0;for(let t=0;t<2e3&&e<70;t++){let t=y.min.x-120+c()*(y.max.x-y.min.x+240),n=y.min.z-120+c()*(y.max.z-y.min.z+240);N(t,n,9)&&(ps(t,n)<.2&&r.sample(t,n,m).h<1.5||(T(`broad`+e%4,()=>J.createBroadleafTree({seed:e%4}),t,n,c()*6.28,.8+c()*.5),e++))}}if(Qs(J,`createBush`)){let e=0;for(let t=0;t<1500&&e<90;t++){let t=y.min.x-60+c()*(y.max.x-y.min.x+120),n=y.min.z-60+c()*(y.max.z-y.min.z+120);N(t,n,3.5)&&(T(`bush`+e%3,()=>J.createBush({seed:e%3,flowers:e%3==0}),t,n,c()*6.28,.8+c()*.6,{collide:!1}),e++)}}if(Qs($s,`createTorii`)){let e=u.cpToS(11.55),t=u.frameAt(e);T(`hillTorii`,()=>$s.createTorii({style:`myojin`,material:`vermilion`,height:10.5,span:20.5,plaque:`稲荷神社`,seed:8}),t.pos.x,t.pos.z,D(t),1,{y:t.pos.y-.2,collide:!1});for(let e of[-1,1]){let n=t.pos.clone().addScaledVector(t.right,e*10.25);l.add(n.x,n.z,.8)}}if(Qs($s,`createStoneLantern`))for(let e of[-1,1])Ws(u,u.cpToS(11.7),u.cpToS(12.8),12,e,1.6,(t,n)=>T(`lantern`,()=>$s.createStoneLantern({lit:!1,seed:1}),t.x,t.z,E(n,e)));if(Qs(J,`createGuardrail`)){let e=[{s0:u.cpToS(9.2),s1:u.cpToS(10.4),side:-1},{s0:u.cpToS(12.2),s1:u.cpToS(13.1),side:1},{s0:u.cpToS(12.2),s1:u.cpToS(13.1),side:-1},{s0:u.cpToS(18.2),s1:u.cpToS(18.72),side:-1},{s0:u.cpToS(18.2),s1:u.cpToS(18.72),side:1},{s0:u.cpToS(19.35),s1:u.cpToS(19.8),side:-1},{s0:u.cpToS(19.35),s1:u.cpToS(19.8),side:1}];for(let t of e){Ws(u,t.s0,t.s1,8,t.side,1,(e,n)=>{T(`guardrail`,()=>J.createGuardrail({length:8}),e.x,e.z,E(n,t.side),1,{collide:!1})});let e=u.idx(t.s0),n=Math.ceil(u.forwardDist(t.s0,t.s1)/u.ds);for(let r=0;r<=n;r++){let n=(e+r)%u.count;t.side<0?u.wallL[n]=Math.min(u.wallL[n],u.w[n]+.9):u.wallR[n]=Math.min(u.wallR[n],u.w[n]+.9)}}}for(let[e,t]of[[3.1,-1],[8.9,-1],[9.6,-1],[17.9,-1],[18.4,-1]]){let t=u.cpToS(e),n=u.frameAt(t),r=u.curv[u.idx(t+15)]>0?1:-1,i=-r,a=n.pos.clone().addScaledVector(n.right,i*(n.width+2.2));T(`sign`+r,()=>qs(r),a.x,a.z,D(n)+Math.PI,1,{collide:!1})}g(`props placed`);let ne=f.get(`norail`)?null:tc(e,l,T,_);ne&&s.push(ne.update),g(`railway`),C.build(t);for(let e of C.colliders)l.add(e.x,e.z,e.r);g(`props built (${C.protos.size} protos, ${C.group.children.length} meshes)`);let re=4300,ie=Vs({height:880,radius:2500,color:4870002,snowColor:16773354,haze:14264470,hazeAmt:.58,sunDir:o.toArray(),sunColor:16756848,ambient:8025240,snowLine:.7});ie.position.set(ls[0]+Math.cos(us+.18)*re,-80,ls[1]+Math.sin(us+.18)*re),t.add(ie);let ae=Hs({radius:2700,step:520,layers:3,minH:90,maxH:260,haze:13017248,color:3488594,hazeBase:.4,hazeStep:.18,gap:{angle:us+.18,width:.35},seed:9});ae.position.set(ls[0],-60,ls[1]),t.add(ae);let oe=nc(t,36);return s.push((e,t,n)=>oe.update(e,t,n&&n.camera,r)),{update(e,t,n){for(let r of s)r(e,t,n)},attachFX(e){ne&&(ne.fx=e)},dispose(){ne&&ne.dispose()}}}function tc(e,t,n,r){let{scene:i,track:a,terrain:o}=e,s=1180,c=new W;c.name=`railway`;let l=[],u=[],d=[],f=e=>Math.abs(e)<560?o.heightAt(205,e):cs;for(let e=-590;e<s/2;e+=2){let t=f(e),n=f(e+2),r=Math.abs(e-ds(205))<22,i=r?.7:t,a=Math.abs(e+2-ds(205))<22?.7:n;if(!r){let r=new Qe(3.6,.35,2.02);r.translate(205,(t+n)/2+.05,e+1),l.push(r)}for(let t=0;t<2;t+=.66){let n=new Qe(2.3,.14,.22),r=i+(a-i)*(t/2);n.translate(205,r+.26,e+t),u.push(n)}for(let t of[-.535,.535]){let n=new Qe(.08,.14,2.01),r=Math.atan2(a-i,2);n.rotateX(-r),n.translate(205+t,(i+a)/2+.4,e+1),d.push(n)}}let p=e=>{let t=new we,n=e.map(e=>e.toNonIndexed());for(let e of[`position`,`normal`,`uv`]){let r=n.reduce((t,n)=>t+n.attributes[e].array.length,0),i=new Float32Array(r),a=0;for(let t of n)i.set(t.attributes[e].array,a),a+=t.attributes[e].array.length;t.setAttribute(e,new st(i,n[0].attributes[e].itemSize))}return t},m=(e,t,n=!0)=>{let r=new U(p(e),t);r.castShadow=n,r.receiveShadow=!0,c.add(r)};m(l,La(`inaka.ballast`,{color:8222576,roughness:1}),!1),m(u,Ia(`woodDark`)),m(d,La(`inaka.rail`,{color:9078144,metalness:.9,roughness:.35}));let h=ds(205),g=new Qe(3.2,1.2,46);g.translate(205,0,h);let _=new U(g,La(`inaka.girder`,{color:10238762,metalness:.5,roughness:.55}));_.castShadow=!0,_.receiveShadow=!0,c.add(_);for(let e of[-12,0,12]){let t=new Qe(2.4,6,2);t.translate(205,-3.4,h+e);let n=new U(t,Ia(`concrete`));n.castShadow=!0,c.add(n)}for(let e of[-1,1]){let t=e*560,n=new W,r=new U(new Qe(12,10,3),Ia(`concrete`));r.position.y=5;let a=new U(new Qe(13,.8,3.6),Ia(`stoneDark`));a.position.y=10.2;let o=new U(new bt(2.9,2.9,3.4,24,1,!1,0,Math.PI),La(`inaka.tunnelDark`,{color:263172,roughness:1}));o.rotation.set(Math.PI/2,0,Math.PI/2),o.position.y=3.6;let s=new U(new Qe(5.8,3.6,3.4),o.material);s.position.y=1.8,n.add(r,a,o,s);for(let e of n.children)e.castShadow=!0,e.receiveShadow=!0;n.position.set(205,cs-.3,t+e*1.2),i.add(n)}i.add(c);let v=[];for(let e=0;e<a.count;e++){let t=(e+1)%a.count;if((a.px[e]-205)*(a.px[t]-205)<=0&&!a.inGap(e*a.ds)){let t=e*a.ds;if(v.some(e=>Math.abs(a.deltaS(e.s,t))<30))continue;v.push({s:t,z:a.pz[e],units:[]})}}let y=J;for(let e of v){if(!Qs(y,`createRailwayCrossing`))break;let n=a.frameAt(e.s);for(let r of[-1,1]){let a=y.createRailwayCrossing({active:!1}),s=r*4.2,c=n.pos.clone().addScaledVector(n.tan,s).addScaledVector(n.right,r*(n.width+1.3));c.y=o.heightAt(c.x,c.z),a.group.position.copy(c);let l=-r*n.right.x,u=-r*n.right.z;a.group.rotation.y=Math.atan2(-u,l),i.add(a.group),e.units.push(a),t.add(c.x,c.z,.5)}}let b=null;Qs(y,`createTrain`)&&(b=y.createTrain({cars:2,lit:!0}),i.add(b.group));let x=b&&b.length||37,S={z:s/2,dir:-1,wait:6,speed:26},C={fx:null,dispose(){C.bell&&C.bell.stop&&C.bell.stop(),C.run&&C.run.stop&&C.run.stop(),C.bell=null,C.run=null},update(e,t,n){S.wait>0?(S.wait-=e,b&&(b.group.visible=!1)):(S.z+=S.dir*S.speed*e,b&&(b.group.visible=!0),S.dir<0&&S.z<-590-x?(S.dir=1,S.wait=18+Math.random()*10,S.z=-590-x):S.dir>0&&S.z>s/2+x&&(S.dir=-1,S.wait=18+Math.random()*10,S.z=s/2+x));let r=S.z,i=S.z-S.dir*x;if(b){b.group.position.set(205,0,r),b.group.rotation.y=S.dir>0?0:Math.PI;let n=Math.max(f(r),f((r+i)/2))+.46;b.group.position.y=Math.abs(r-ds(205))<22?1.1:n,b.update&&b.update(e,t)}for(let n of v){let a=Math.min(r,i),o=Math.max(r,i),s=(S.wait>0?1/0:n.z<a?a-n.z:n.z>o?n.z-o:0)<170;for(let r of n.units)r.setActive(s),r.update&&r.update(e,t);n.active=s}if(n&&n.race){let e=Math.min(r,i),t=Math.max(r,i);for(let r of n.race.karts){if(S.wait>0)break;if(Math.abs(r.pos.x-205)<2.4&&r.pos.z>e-1&&r.pos.z<t+1&&r.pos.y<f(r.pos.z)+4.5){let e=r.pos.x<205?-1:1;r.pos.x=205+e*2.6,r.vel.x=e*14,r.vel.z+=S.dir*S.speed*.6,r.hit(`tumble`)&&r.emit(`train_hit`)}}let o=n.race.player,s=0;for(let e of v)e.active&&(s=Math.max(s,Math.max(0,1-o.pos.distanceTo(a.frameAt(e.s).pos)/140)));let c=n.audio;if(c){s>.01&&!C.bell&&(C.bell=c.startLoop(`crossing_bell`,{volume:s})),C.bell&&C.bell.setVolume&&C.bell.setVolume(s),s<=.01&&C.bell&&(C.bell.stop&&C.bell.stop(),C.bell=null);let n=Math.abs(o.pos.x-205)+Math.max(0,Math.max(e-o.pos.z,o.pos.z-t)),r=S.wait>0?0:Math.max(0,1-n/220);r>.01&&!C.run&&(C.run=c.startLoop(`train_run`,{volume:r})),C.run&&C.run.setVolume&&C.run.setVolume(r),r<=.01&&C.run&&(C.run.stop&&C.run.stop(),C.run=null),r>.25&&!C.horned&&(c.play(`train_horn`,{volume:r}),C.horned=!0),r<.05&&(C.horned=!1)}}}};return C}function nc(e,t){let n=new bt(.012,.02,.16,5).rotateX(Math.PI/2),r=new se(.2,.05),i=new R({color:14172191,roughness:.5,emissive:4198405}),a=new R({color:16777215,transparent:!0,opacity:.35,roughness:.2,side:2,depthWrite:!1}),o=[],s=new W;for(let e=0;e<t;e++){let e=new W;e.add(new U(n,i));for(let[t,n]of[[-.1,.03],[.1,.03],[-.09,-.02],[.09,-.02]]){let i=new U(r,a);i.position.set(t,.01,n),i.rotation.x=-Math.PI/2,e.add(i)}e.scale.setScalar(1.6),s.add(e),o.push({obj:e,phase:Math.random()*100,center:new I,r:2+Math.random()*6,h:1+Math.random()*3,speed:.4+Math.random()*.6,init:!1})}return e.add(s),{update(e,t,n,r){if(n)for(let e of o){if(!e.init||e.center.distanceTo(n.position)>60){let t=Math.random()*Math.PI*2,i=12+Math.random()*40;e.center.set(n.position.x+Math.cos(t)*i,0,n.position.z+Math.sin(t)*i),e.center.y=Math.max(r.heightAt(e.center.x,e.center.z),os)+e.h,e.init=!0}let i=t*e.speed+e.phase;e.obj.position.set(e.center.x+Math.cos(i)*e.r+Math.sin(i*3.1)*.5,e.center.y+Math.sin(i*2.3)*.4,e.center.z+Math.sin(i*.8)*e.r),e.obj.rotation.y=-i+Math.PI/2;let a=Math.sin(t*60+e.phase)*.4;e.obj.children[1].rotation.z=a,e.obj.children[2].rotation.z=-a}}}}var rc={id:`inaka`,name:`夕焼けたんぼ道`,subtitle:`Yuyake Tanbo Road`,description:`夕日にそまる田んぼの農道。踏切の電車と、川越えの和傘グライダーに注目！`,laps:3,bgm:`inaka`,ambience:`inaka`,colors:[`#f2a65a`,`#b8527a`],track:{width:7.5,wallMargin:18,points:[[0,.3,40,9],[0,.3,-20,9],[2,.3,-80,8.5],[20,.2,-125,8],[60,.1,-145,7.5],[120,.1,-152,7.5],[180,.1,-150,7.5],[230,.2,-146,7.5],[280,.3,-135,7.5],[318,.8,-105,8,.05],[330,2.5,-60,8],[322,6.5,-15,8],[300,11,20,8,-.04],[272,14.5,45,8.5],[235,3.5,135,9],[190,1.2,165,8],[120,.6,175,7.5],[60,.4,168,7.5],[18,.3,145,8,-.04],[2,.6,100,8],[0,.4,70,9]],zones:{gaps:[{from:13.25,to:13.82}],bridges:[{from:18.72,to:19.35,style:`stone`}],ramps:[{at:{cp:13.25,off:-12},len:12,h:2.2,d0:-7.5,d1:7.5,type:`glide`,launch:11},{at:5.6,len:8,h:1.3,d0:-3.5,d1:3.5,type:`jump`,launch:8.5}],boosts:[{at:10.4,d:0,len:5},{at:2.2,d:-4,len:5},{at:16.4,d:3.5,len:5}],items:[{at:1.5},{at:7.2},{at:11.5},{at:15.6}],coins:[{from:4.3,to:4.9,d:-3,count:6},{from:8.2,to:8.8,d:2,count:5},{from:14.3,to:14.9,d:-2,count:6},{from:17.2,to:17.8,d:3,count:5},{from:13.32,to:13.74,d:2,count:7,h:6,arc:2.5,wave:3}],walls:[]}},trackStyle:{road:`asphalt`,roadOpts:{center:`dash`,edgeDirt:`rgba(120,100,70,0.35)`,seed:3},skirtMat:`stoneDark`},terrain:{natural:hs,shoulder:2.2,blend:6,waterLevelAt:gs,surfaceAt:_s,colorAt:vs},waterLevelAt:gs,surfaceAt:_s,shallowWater:`paddy`,killY:-20,build:ec,introShots:e=>[{from:[232,6.5,-176],to:[150,4.5,-180],look:[-500,60,-420],dur:3.6,fov:52},{from:[212,5,112],to:[236,10,84],look:[272,16,45],lookTo:[268,19,40],dur:3,fov:55}],env:{sky:{zenith:3825566,horizon:15905402,haze:16756848,ground:3879718,sunDir:[-.9,.26,-.36],sunColor:16757854,sunSize:9e-4,sunGlow:1.4,sunDisk:18,cloudCover:.56,cloudSoft:.22,cloudOpacity:.85,cloudLit:16763296,cloudShade:9072518,gradExp:.45,billboards:{count:14,lit:16237218,shade:8810650,opacity:.9,minH:160,maxH:420,dist:2500,minW:520,maxW:1150,rimAmt:1.2}},sun:{color:16760960,intensity:4.2,shadowFar:200},hemi:{sky:9085910,ground:5915696,intensity:.55},fog:{color:12165280,density:85e-5,sunColor:16756848},envIntensity:.6,look:{exposure:1.05,bloomStrength:.5,bloomRadius:.6,bloomThreshold:.92,saturation:1.12,contrast:1.05,tint:[1.03,.99,.95],lift:[.01,0,.015],vignette:.38,grain:.018}}},ic=Ga(4242),ac=Ga(99),oc=1.2,sc=[40,-120],cc=-2.2,lc=[14,-326];function uc(e,t,n,r,i,a){let o=(e-n)*(e-n)+(t-r)*(t-r);return i*Math.exp(-o/(2*a*a))}function dc(e,t,n,r,i,a){let o=i-n,s=a-r,c=Math.max(0,Math.min(1,((e-n)*o+(t-r)*s)/(o*o+s*s)));return Math.hypot(e-(n+o*c),t-(r+s*c))}function fc(e,t){return Math.min(dc(e,t,lc[0],lc[1],-60,-230),dc(e,t,-60,-230,-140,-150),dc(e,t,-140,-150,-150,-40),dc(e,t,-150,-40,-135,60))}function pc(e,t){return K(70,45,Math.abs(e+5))*K(-95,-60,t)*K(175,150,t)}function mc(e,t){let n=.2+Ka(ic,e/90,t/90,3)*1.2;n+=K(-40,-120,e)*(2.5+Ka(ac,e/60,t/60,3)*2.5),n+=uc(e,t,110,-300,64,115)+uc(e,t,175,-380,46,90)+uc(e,t,25,-430,55,110)+uc(e,t,220,-250,30,70),n+=uc(e,t,185,70,10,30);let r=K(80,18,dc(e,t,25,-312,-70,-236))*K(-480,-330,t);n=q(n,1.5+Ka(ac,e/20,t/20,2)*1.5,r*.95);let i=K(84,56,Math.hypot(e-118,t-345));n=q(n,44.7,i);let a=fc(e,t),o=Math.hypot(e-lc[0],t-lc[1]);n=q(n,Math.min(n,-.40000000000000013),K(26,16,o)),n=q(n,Math.min(n,.29999999999999993),K(7,3,a)),n=q(n,.2,pc(e,t)*.85);let s=e-sc[0],c=t-sc[1],l=Math.hypot(s,c),u=.35+.65*K(.1,.55,Math.abs(((Math.atan2(c,s)-cc+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI));return n+=K(480,900,l)*(30+70*(.5+.5*Ka(ic,e/250,t/250,4)))*u,n+=K(850,1500,l)*(80+200*(.5+.5*Ka(ac,e/400,t/400,4)))*u,n}function hc(e,t){return Math.hypot(e-lc[0],t-lc[1])<30||fc(e,t)<8?oc:-1/0}function gc(e,t,n){return n.edge<2.5?`dirt`:`grass`}function _c(e,t,n,r,i){let a=Ka(ac,e/12,t/12,3),o=Ka(ic,e/60,t/60,2),s=[.2+o*.05,.4+a*.07,.1],c=Math.max(pc(e,t)*.35,K(80,40,Math.hypot(e-118,t+345))*.3)*(.5+a*.8);if(s=[q(s[0],.75,c*.4),q(s[1],.52,c*.4),q(s[2],.55,c*.4)],n<1&&(s=[.2,.22,.16]),r<2.8){let e=K(2.8,.6,r);s=[q(s[0],.45,e),q(s[1],.4,e),q(s[2],.32,e)]}let l=K(.3,.6,i),u=K(.35,.65,Ka(ic,e/9,t/9,3)*.5+.5),d=[q(.2,.42,u),q(.3,.4,u),q(.1,.34,u)];s=[q(s[0],d[0],l),q(s[1],d[1],l),q(s[2],d[2],l)];let f=K(460,820,Math.hypot(e-sc[0],t-sc[1]));return s=[q(s[0],.1+o*.03,f),q(s[1],.24+a*.04,f),q(s[2],.12,f)],s}var vc=`
varying vec2 vUv;
varying vec3 vWorld;
#include <fog_pars_vertex>
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`,yc=`
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uFoam;
varying vec2 vUv;
varying vec3 vWorld;
#include <fog_pars_fragment>
float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),u.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x), u.y); }
void main() {
  vec2 uv = vUv;
  float streak = vn(vec2(uv.x * 24.0, uv.y * 3.0 + uTime * 2.2));
  streak = streak * 0.6 + vn(vec2(uv.x * 60.0, uv.y * 6.0 + uTime * 3.4)) * 0.4;
  float foam = smoothstep(0.15, 0.0, uv.y) + smoothstep(0.93, 1.0, uv.y) * 0.5;
  vec3 col = mix(uColor, uFoam, clamp(streak * 1.2 - 0.2 + foam, 0.0, 1.0));
  float edge = smoothstep(0.0, 0.08, uv.x) * smoothstep(1.0, 0.92, uv.x);
  float a = (0.75 + streak * 0.25) * edge;
  gl_FragColor = vec4(col * 1.25, a);
  #include <fog_fragment>
}
`;function bc(e,t,n=10,{color:r=10471384,foam:i=16777215,heightAt:a=null}={}){let o=new I(...e),s=new I(...t),c=new I(s.x-o.x,0,s.z-o.z).normalize(),l=new I(-c.z,0,c.x),u=[],d=[],f=[];for(let e=0;e<=40;e++){let t=e/40,r=new I().lerpVectors(o,s,t);a||r.addScaledVector(c,Math.sin(t*Math.PI)*2);for(let e of[-.5,.5]){let i=n*(1+t*.35),o=r.clone().addScaledVector(l,e*i);a&&(o.y=Math.max(o.y,a(o.x,o.z)+.45)),u.push(o.x,o.y,o.z),d.push(e+.5,1-t)}}for(let e=0;e<40;e++){let t=e*2;f.push(t,t+2,t+1,t+1,t+2,t+3)}let p=new we;p.setAttribute(`position`,new M(u,3)),p.setAttribute(`uv`,new M(d,2)),p.setIndex(f),p.computeVertexNormals();let m=new P({uniforms:fe.merge([G.fog,{uTime:{value:0},uColor:{value:new B(r)},uFoam:{value:new B(i)}}]),vertexShader:vc,fragmentShader:yc,transparent:!0,depthWrite:!1,side:2,fog:!0});Object.assign(m.uniforms,la.uniforms());let h=new U(p,m);return h.name=`waterfall`,h.renderOrder=2,{mesh:h,base:s,update(e,t){if(m.uniforms.uTime.value+=e,t&&Math.random()<e*40){let e=l.clone().multiplyScalar((Math.random()-.5)*n*1.3);t.smoke.spawn({x:s.x+e.x,y:s.y+.5,z:s.z+e.z,vx:(Math.random()-.5)*2-c.x*2,vy:1+Math.random()*2,vz:(Math.random()-.5)*2-c.z*2,life:2+Math.random(),size:2,size1:6,r:.9,g:.95,b:1,a:.28,a1:0,drag:.8})}}}}var xc=(e,t)=>e&&typeof e[t]==`function`;async function Sc(e){let{scene:t,track:n,terrain:r,world:i,renderer:a}=e,o=await Zs(()=>import(`./shrine-XOlbh7ba.js`),__vite__mapDeps([3,1,2]),import.meta.url).catch(e=>(console.warn(`shrine props unavailable`,e),{})),s=await Zs(()=>import(`./festival-C4MIQmKz.js`),__vite__mapDeps([4,1,2]),import.meta.url).catch(e=>(console.warn(`festival props unavailable`,e),{})),c=await Zs(()=>import(`./rural-D_WNArV8.js`),__vite__mapDeps([0,1,2]),import.meta.url).catch(e=>(console.warn(`rural props unavailable`,e),{})),l=i.env.sky.sunDir.clone(),u=[],d=Us(777),f=new Gs(12);i.colliders=f;let p=n.length,m=n.bounds,h={},g=new Rs({chunk:160}),_=(e,t)=>r.heightAt(e,t),v=(e,t,n,r,i=0,a=1,o={})=>{let s=o.y??_(n,r);g.add(e,t,{x:n,y:s,z:r,rotY:i,scale:a,collide:o.collide??!0})},y=(e,t)=>Math.atan2(-e.right.x*t,-e.right.z*t),b=e=>Math.atan2(e.tan.x,e.tan.z),x=(e,t,n=5)=>!(r.sample(e,t,h).edge<n||fc(e,t)<9||Math.hypot(e-lc[0],t-lc[1])<30),S=new Ts(a.renderer,t,l,{reflection:i.quality!==`low`,reflectionHeight:oc,reflectionScale:.5}),C=ws(r,oc,{minX:-200,maxX:60,minZ:-360,maxZ:120,cell:2.5,include:(e,t)=>Math.hypot(e-lc[0],t-lc[1])<34||fc(e,t)<9,material:Cs({deep:2050642,shallow:5933688,skyTop:3832016,skyHorizon:14215416,sunColor:16774368,reflStrength:.85,waveAmp:.1,waveScale:.9,flow:.3,edgeFade:.2,specular:1})});S.add(C,{reflect:!0}),u.push(e=>S.update(e)),i.beforeRender=(e,t)=>S.beforeRender(e,t),i.water=S;let w=bc([74,44.4,-352],[lc[0]+12,oc,lc[1]-10],8,{heightAt:(e,t)=>r.heightAt(e,t)});t.add(w.mesh);let T=null;u.push(e=>w.update(e,T));let E=Ds({vertexColors:!0,roughness:.85,side:2},{amp:.55,key:`sgrass`}),D=new js(Os({blades:14,height:.4,spread:.26,width:.018,lean:.5,colorBase:[.14,.26,.06],colorTip:[.5,.72,.22],seed:21}),E,{chunk:40,maxDist:110,name:`grass`}),O=Ds({vertexColors:!0,roughness:.7,side:2},{amp:.7,key:`nanohana`}),k=new js(Os({blades:10,height:.75,spread:.2,width:.03,lean:.25,colorBase:[.15,.32,.07],colorTip:[1,.86,.1],seed:31}),O,{chunk:40,maxDist:120,name:`nanohana`});for(let e=0;e<p;e+=.9){if(n.inGap(e))continue;let t=n.frameAt(e);for(let e of[-1,1]){let n=.3+d()*4,i=t.pos.clone().addScaledVector(t.right,e*(t.width+n)),a=r.sample(i.x,i.z,h);Math.abs(a.h-t.pos.y)>3||D.add(i.x,a.h-.02,i.z,d()*6.28,.7+d()*.6)}}for(let e=0;e<3e4;e++){let e=m.min.x-150+d()*(m.max.x-m.min.x+300),t=m.min.z-150+d()*(m.max.z-m.min.z+300),n=r.sample(e,t,h);n.edge<.6||fc(e,t)<6||Math.hypot(e-lc[0],t-lc[1])<28||pc(e,t)>.5&&n.edge>8||(e<-40&&t>-220&&t<90&&Math.sin(e*.05)+Math.cos(t*.045)>.4&&d()<.7?k.add(e,n.h-.02,t,d()*6.28,.8+d()*.5):D.add(e,n.h-.02,t,d()*6.28,.6+d()*.8))}if(D.build(t),k.build(t),u.push((e,t,n)=>{n&&n.camera&&(D.update(n.camera),k.update(n.camera))}),xc(o,`createTorii`)){let e=n.cpToS(11.05),t=n.cpToS(13.9)-e;t<0&&(t+=p);let r=0;for(let i=0;i<t;i+=3.1){let t=n.frameAt(e+i),a=r%3;v(`senbon`+a,()=>o.createTorii({style:`myojin`,material:`vermilion`,height:7.4,span:15.4,plaque:a===0?`奉納`:null,seed:20+a}),t.pos.x,t.pos.z,b(t),1,{y:t.pos.y-.15,collide:!1}),r++}let i=n.frameAt(e-10);v(`bigTorii`,()=>o.createTorii({style:`myojin`,material:`vermilion`,height:11,span:19.5,plaque:`稲荷神社`,seed:3}),i.pos.x,i.pos.z,b(i),1,{y:i.pos.y-.2,collide:!1});for(let e of[-1,1]){let t=i.pos.clone().addScaledVector(i.right,e*9.75);f.add(t.x,t.z,.8)}}if(xc(o,`createTorii`)){let e=n.frameAt(0);v(`startTorii`,()=>o.createTorii({style:`myojin`,material:`vermilion`,height:11.5,span:21.5,plaque:`ぽんぽこ`,seed:5}),e.pos.x,e.pos.z,b(e),1,{y:e.pos.y-.2,collide:!1});for(let t of[-1,1]){let n=e.pos.clone().addScaledVector(e.right,t*10.75);f.add(n.x,n.z,.8)}}if(xc(o,`createPagoda`)&&v(`pagoda`,()=>o.createPagoda({seed:1}),150,-372,Math.PI*.85),xc(o,`createShrineHall`)&&v(`hall`,()=>o.createShrineHall({seed:1}),95,-382,.15),xc(o,`createKomainu`)&&(v(`komaA`,()=>o.createKomainu({side:`a`,seed:1}),84,-360,.15+.3),v(`komaU`,()=>o.createKomainu({side:`un`,seed:1}),106,-358,-.15)),xc(o,`createGoshinboku`)&&v(`goshin`,()=>o.createGoshinboku({seed:2}),185,-335,.7),xc(o,`createEmaRack`)&&v(`ema`,()=>o.createEmaRack({seed:1}),122,-368,.2),xc(o,`createTemizuya`)&&v(`temizu`,()=>o.createTemizuya({seed:1}),70,-365,.4),xc(o,`createStoneLantern`))for(let e of[-1,1])Ws(n,n.cpToS(14.1),n.cpToS(15.9),11,e,3.8,(t,n)=>v(`slantern`,()=>o.createStoneLantern({lit:!1,seed:2}),t.x,t.z,y(n,e))),Ws(n,n.cpToS(1),n.cpToS(2),14,e,3,(t,n)=>v(`slantern`,()=>o.createStoneLantern({lit:!1,seed:2}),t.x,t.z,y(n,e)));if(xc(o,`createToro`)&&Ws(n,n.cpToS(13.9),n.cpToS(14.9),9,1,2.5,(e,t)=>v(`toro`,()=>o.createToro({lit:!1,seed:1}),e.x,e.z,y(t,1))),xc(o,`createStoneWall`))for(let[e,t,r,i]of[[4.4,11,-1],[4.4,11,1],[13.95,16,-1],[13.95,16,1]])Ws(n,n.cpToS(e),n.cpToS(t),7.5,r,i??(e>13?3.3:2.8),(e,t)=>v(`swall`,()=>o.createStoneWall({length:8,height:1.1,seed:6}),e.x,e.z,y(t,r),1,{collide:!1}));let A=[[n.cpToS(22.6),n.cpToS(23.95)],[0,n.cpToS(1.9)]],ee=0;for(let[e,t]of A)for(let r of[-1,1])if(Ws(n,e,t,11,r,9.5,(e,t,i)=>{if(Math.abs(n.deltaS(i,0))<12)return;ee++;let a=y(t,r);if(xc(s,`createMachiya`)&&ee%3!=0){let n=ee%4,i=e.clone().addScaledVector(t.right,r*3.5);v(`machiya`+n,()=>s.createMachiya({lit:!1,seed:n}),i.x,i.z,a)}else if(xc(c,`createTileHouse`)){let n=e.clone().addScaledVector(t.right,r*5);v(`tile`+ee%3,()=>c.createTileHouse({seed:ee%3}),n.x,n.z,a)}}),xc(s,`createNobori`)){let i=[`桜まつり`,`団子`,`甘味`,`茶屋`],a=0;Ws(n,e,t,16,r,2.4,(e,t)=>{let n=i[a++%i.length];v(`nobori`+n,()=>s.createNobori({text:n,seed:a,lit:!1}),e.x,e.z,y(t,r),1,{collide:!1})})}if(xc(s,`createNodateBench`)){let e=n.frameAt(n.cpToS(.6)),t=e.pos.clone().addScaledVector(e.right,-(e.width+5));v(`bench`,()=>s.createNodateBench({seed:1,lit:!1}),t.x,t.z,y(e,-1))}if(xc(o,`createCastle`)&&v(`castle`,()=>o.createCastle({seed:1}),185,70,-2.4,1),xc(o,`createRedBridge`)&&v(`redbridge`,()=>o.createRedBridge({length:16,width:3.2,seed:1}),-148,-96,.05,1,{y:oc+.4}),xc(o,`createSakuraTree`)){for(let[e,t,i]of[[n.cpToS(22.3),n.cpToS(23.99),13],[0,n.cpToS(2.6),13],[n.cpToS(18.3),n.cpToS(22),17],[n.cpToS(2.8),n.cpToS(4.6),18]])for(let a of[-1,1])Ws(n,e,t,i,a,4.2+d()*1.5,(e,t,i)=>{if(Math.abs(n.deltaS(i,0))<10||!x(e.x,e.z,3))return;let a=Math.floor(d()*4),s=r.normalAt(e.x,e.z).y>.985;v(`sakura`+a+(s?``:`nc`),()=>o.createSakuraTree({seed:10+a,size:1,carpet:s}),e.x,e.z,d()*6.28,.85+d()*.3)});let e=0;for(let t=0;t<2500&&e<120;t++){let t=-60+d()*300,n=-440+d()*330;if(!x(t,n,7)||_(t,n)<3)continue;let i=Math.floor(d()*4),a=r.normalAt(t,n).y>.985;v(`sakura`+i+(a?``:`nc`),()=>o.createSakuraTree({seed:10+i,size:1,carpet:a}),t,n,d()*6.28,.8+d()*.35),e++}}if(xc(o,`createWeepingSakura`))for(let[e,t]of[[-120,-150],[-118,-40],[-60,-110],[-125,30],[60,-350],[130,-318]]){if(!x(e,t,4))continue;let n=r.normalAt(e,t).y>.985;v(`shidare`+(n?``:`nc`),()=>o.createWeepingSakura({seed:4,carpet:n}),e,t,d()*6.28,1)}if(xc(o,`createPine`)){let e=0;for(let t=0;t<1500&&e<50;t++){let t=m.min.x-80+d()*(m.max.x-m.min.x+160),n=m.min.z-80+d()*(m.max.z-m.min.z+160);x(t,n,8)&&(_(t,n)<8||(v(`pine`+e%3,()=>o.createPine({seed:e%3}),t,n,d()*6.28,.9+d()*.4),e++))}}if(xc(c,`createCedar`)){let e=0;for(let t=0;t<3e3&&e<140;t++){let t=-150+d()*450,n=-560+d()*260;x(t,n,10)&&(_(t,n)<12||(v(`cedar`+e%4,()=>c.createCedar({seed:e%4}),t,n,d()*6.28,.8+d()*.5),e++))}}if(xc(c,`createBambooClump`))for(let[e,t]of[[-30,-160],[20,-150],[200,-205],[215,-150],[-150,100],[60,-60]])x(e,t,6)&&v(`bamboo`+Math.abs(Math.round(e))%3,()=>c.createBambooClump({seed:Math.abs(Math.round(e))%3}),e,t,d()*6.28);for(let[e,t]of[[5.4,-1],[9.4,1],[13.2,-1],[21.9,-1]]){let r=n.cpToS(e),i=n.frameAt(r),a=i.pos.clone().addScaledVector(i.right,-t*(i.width+2));v(`sign`+t,()=>qs(t),a.x,a.z,b(i)+Math.PI,1,{collide:!1})}g.build(t);for(let e of g.colliders)f.add(e.x,e.z,e.r);let te=Vs({height:950,radius:2600,color:5926814,snowColor:16777215,haze:13032176,hazeAmt:.45,sunDir:l.toArray(),sunColor:16773344,ambient:9083584,snowLine:.6});te.position.set(sc[0]+Math.cos(cc)*4200,-80,sc[1]+Math.sin(cc)*4200),t.add(te);let j=Hs({radius:2600,step:500,layers:3,minH:100,maxH:300,haze:12571626,color:4086382,topColor:11125725,hazeBase:.35,hazeStep:.18,gap:{angle:cc,width:.3},seed:12});j.position.set(sc[0],-60,sc[1]),t.add(j);let M={acc:0};return u.push((e,t,n)=>{if(!T||!n||!n.camera)return;M.acc+=e*70;let r=n.camera.position;for(;M.acc>1;){--M.acc;let e=r.x+(Math.random()-.5)*60,t=r.z+(Math.random()-.5)*60,n=r.y+4+Math.random()*10,i=Math.random();T.petals.spawn({x:e,y:n,z:t,vx:.8+Math.random()*.8,vy:-.7-Math.random()*.5,vz:.3+Math.random()*.4,life:9,size:.1+Math.random()*.05,size1:.1,r:1,g:.74+i*.12,b:.82+i*.08,a:1,a1:.8,drag:.3,vrot:(Math.random()-.5)*6,flutter:2.2,floorY:_(e,t)+.03})}}),{update(e,t,n){for(let r of u)r(e,t,n)},attachFX(e){T=e}}}var Cc={id:`sakura`,name:`桜咲く千本鳥居`,subtitle:`Sakura Senbon Torii`,description:`満開の桜の城下町から山道をのぼり、千本鳥居をくぐって山頂の五重塔へ。崖から滝つぼを越えてグライド！`,laps:3,bgm:`sakura`,ambience:`sakura`,colors:[`#f7a8c4`,`#6aa8e8`],track:{width:8,wallMargin:14,points:[[0,.2,60,8.5],[0,.2,-10,8.5],[8,1.5,-70,8],[45,4,-105,7.5,.04],[115,8,-112,7.5],[162,12,-135,7.5,-.06],[172,15,-172,7.5,-.08],[132,19,-190,7.5,-.04],[88,23,-186,7.5],[52,26,-200,7.5,.06],[50,29,-235,7.5,.08],[95,33,-248,6.5],[148,37,-258,6.5,-.03],[176,41,-290,6.5,-.05],[158,44,-325,7],[108,45,-340,8],[60,45,-328,8.5],[-45,27,-232,9],[-85,13,-168,8.5],[-98,4.5,-90,8],[-82,1.8,-12,8],[-72,.6,48,8],[-52,.2,112,8,-.06],[-14,.2,128,8.5,-.05]],zones:{gaps:[{from:16.12,to:16.78}],ramps:[{at:{cp:16.12,off:-12},len:12,h:2.4,d0:-8,d1:8,type:`glide`,launch:10},{at:19.55,len:8,h:1.4,d0:-3.5,d1:3.5,type:`jump`,launch:9}],boosts:[{at:2.3,d:3.5,len:5},{at:7.6,d:0,len:5},{at:11.4,d:0,len:5},{at:21.4,d:-3,len:5}],items:[{at:1.2},{at:8.4},{at:15.3},{at:20.3}],coins:[{from:3.3,to:3.9,d:2.5,count:6},{from:11.6,to:12.4,d:0,count:8},{from:17.3,to:17.9,d:-2,count:6},{from:22.1,to:22.8,d:3,count:5},{from:16.2,to:16.72,d:-2,count:8,h:6,arc:3,wave:3.5}],walls:[{from:4.4,to:11,side:`both`,offset:2.5},{from:11,to:13.95,side:`both`,offset:.9},{from:13.95,to:16,side:`both`,offset:3},{from:23.2,to:25.9,side:`both`,offset:5},{from:0,to:2.1,side:`both`,offset:5}]}},trackStyle:{road:`stone`,roadOpts:{hue:32,rows:12,moss:!0,seed:8},roadRoughness:.88,skirtMat:`stoneDark`,texLen:14},terrain:{natural:mc,shoulder:2,blend:9,waterLevelAt:hc,surfaceAt:gc,colorAt:_c},terrainMesh:{res:2,margin:100,outer:1800},waterLevelAt:hc,surfaceAt:gc,shallowWater:`water`,killY:-10,build:Sc,introShots:e=>[{path:{track:e,s0:e.cpToS(11.1),s1:e.cpToS(12.7),h:2.6,d:0,ahead:14},dur:3.8,fov:62},{from:[-115,24,-200],to:[-85,30,-238],look:[30,36,-335],lookTo:[110,50,-362],dur:3.2,fov:55}],env:{sky:{zenith:2778828,horizon:13624570,haze:15660287,ground:4872762,sunDir:[.42,.72,.55],sunColor:16774109,sunSize:6e-4,sunGlow:.7,sunDisk:12,cloudCover:.52,cloudSoft:.2,cloudOpacity:.85,cloudLit:16777215,cloudShade:11780826,gradExp:.6,billboards:{count:12,lit:16777215,shade:11452120,opacity:.92,minH:180,maxH:420,dist:2400,minW:500,maxW:1e3,rimAmt:.4}},sun:{color:16773598,intensity:3.6,shadowFar:200},hemi:{sky:12375807,ground:6978122,intensity:1},fog:{color:13163760,density:.0011,sunColor:16774374},envIntensity:1,look:{exposure:1,bloomStrength:.35,bloomRadius:.55,bloomThreshold:1,saturation:1.12,contrast:1.04,tint:[1,.99,1],lift:[.01,.005,.015],vignette:.32,grain:.012}}},wc=Ga(5151),Tc=Ga(313),Ec=-2.2,Dc=[30,10],Oc=e=>4*Math.sin(e/90)+2*Math.sin(e/31+.7);function kc(e,t,n,r,i,a){let o=(e-n)*(e-n)+(t-r)*(t-r);return i*Math.exp(-o/(2*a*a))}function Ac(e,t){let n=.8+Ka(wc,e/80,t/80,3)*.4;n+=kc(e,t,-134,76,7,26)+kc(e,t,-260,200,30,70),n+=kc(e,t,250,-170,30,80)+kc(e,t,60,-230,26,90)+kc(e,t,-60,220,30,90);let r=K(-175,-135,e)*K(250,215,e)*K(-150,-115,t)*K(-8,-25,t),i=K(-100,-60,e)*K(250,220,e)*K(20,35,t)*K(130,110,t);n=q(n,.8+Ka(wc,e/50,t/50,2)*.2,Math.max(r,i));let a=Math.abs(t-Oc(e));n=q(-4,n,K(12,22,a));let o=Math.hypot(e-Dc[0],t-Dc[1]);return n+=K(380,800,o)*(40+90*(.5+.5*Ka(Tc,e/260,t/260,4))),n+=K(800,1500,o)*(90+200*(.5+.5*Ka(wc,e/420,t/420,4))),n}function jc(e,t){return Math.abs(t-Oc(e))<22?Ec:-1/0}function Mc(e,t,n){return n.edge<2.5?`dirt`:`grass`}function Nc(e,t,n,r,i){let a=Ka(Tc,e/12,t/12,3),o=[.13+Ka(wc,e/60,t/60,2)*.04,.22+a*.05,.08];if(n<-1.8000000000000003&&(o=[.12,.12,.1]),r<3){let e=K(3,.5,r);o=[q(o[0],.36,e),q(o[1],.32,e),q(o[2],.27,e)]}let s=Math.abs(t-Oc(e)),c=K(24,16,s)*K(8,13,s);o=[q(o[0],.24,c),q(o[1],.23,c),q(o[2],.22,c)];let l=K(.25,.55,i);o=[q(o[0],.3,l),q(o[1],.29,l),q(o[2],.26,l)];let u=K(380,700,Math.hypot(e-Dc[0],t-Dc[1]));return o=[q(o[0],.07,u),q(o[1],.12,u),q(o[2],.07,u)],o}var Pc=class{constructor(e,{count:t=6,color:n=16753226,intensity:r=40,distance:i=22,decay:a=2}={}){this.anchors=[],this.lights=[];for(let r=0;r<t;r++){let t=new c(n,0,i,a);t.castShadow=!1,e.add(t),this.lights.push(t)}this.baseIntensity=r,this._tmp=[]}add(e,{color:t=null,intensity:n=null}={}){this.anchors.push({pos:e.clone?e.clone():new I(...e),color:t==null?null:new B(t),intensity:n})}update(e,t=0){let n=e.position,r=new I(0,0,-1).applyQuaternion(e.quaternion),i=this._tmp;i.length=0;for(let e of this.anchors){let t=e.pos.x-n.x,a=e.pos.y-n.y,o=e.pos.z-n.z,s=Math.hypot(t,a,o),c=(t*r.x+a*r.y+o*r.z)/Math.max(s,.001);i.push({a:e,score:s*(c>-.2?1:2.5)})}i.sort((e,t)=>e.score-t.score);for(let e=0;e<this.lights.length;e++){let n=this.lights[e],r=i[e];if(!r){n.intensity=0;continue}n.position.copy(r.a.pos),r.a.color&&n.color.copy(r.a.color);let a=.92+.08*Math.sin(t*9+e*1.7)*Math.sin(t*5.3+e),o=ot.clamp(1.4-r.score/90,0,1);n.intensity=(r.a.intensity??this.baseIntensity)*a*o}}},Fc=(e,t)=>e&&typeof e[t]==`function`,Ic=[`takoyaki`,`yakisoba`,`wataame`,`kingyo`,`ringoame`,`kakigori`,`omen`];async function Lc(e){let{scene:t,track:r,terrain:i,world:a,renderer:o}=e,s=await Zs(()=>import(`./shrine-XOlbh7ba.js`),__vite__mapDeps([3,1,2]),import.meta.url).catch(e=>(console.warn(`shrine props unavailable`,e),{})),l=await Zs(()=>import(`./festival-C4MIQmKz.js`),__vite__mapDeps([4,1,2]),import.meta.url).catch(e=>(console.warn(`festival props unavailable`,e),{})),u=await Zs(()=>import(`./rural-D_WNArV8.js`),__vite__mapDeps([0,1,2]),import.meta.url).catch(e=>(console.warn(`rural props unavailable`,e),{})),d=[],f=Us(8080),m=new Gs(12);a.colliders=m,r.length;let h=r.bounds,_={},v=new Rs({chunk:140}),y=(e,t)=>i.heightAt(e,t),b=(e,t,n,r,i=0,a=1,o={})=>{let s=o.y??y(n,r);v.add(e,t,{x:n,y:s,z:r,rotY:i,scale:a,collide:o.collide??!0})},x=(e,t)=>Math.atan2(-e.right.x*t,-e.right.z*t),S=e=>Math.atan2(e.tan.x,e.tan.z),C=new Pc(t,{count:8,color:16752714,intensity:55,distance:26}),w=new I(...a.def.env.sky.moonDir).normalize(),T=new Ts(o.renderer,t,w,{reflection:a.quality!==`low`,reflectionHeight:Ec,reflectionScale:.55}),E=Cs({deep:264724,shallow:793124,skyTop:660530,skyHorizon:1713744,sunColor:13162239,reflStrength:1,waveAmp:.09,waveScale:.8,flow:.5,flowDir:[1,0],edgeFade:.3,specular:.6}),D=ws(i,Ec,{minX:h.min.x-700,maxX:h.max.x+700,minZ:-40,maxZ:40,cell:3,include:(e,t)=>Math.abs(t-Oc(e))<24,material:E});T.add(D,{reflect:!0}),d.push(e=>T.update(e)),a.beforeRender=(e,t)=>T.beforeRender(e,t),a.water=T;let O=new Qe(.5,.5,.5);O.translate(0,.35,0);let k=new R({color:16769712,emissive:16751164,emissiveIntensity:2.6,roughness:.9}),A=new Qe(.62,.1,.62),ee=new R({color:3810840,roughness:.8}),te=new g(O,k,90),j=new g(A,ee,90);te.frustumCulled=j.frustumCulled=!1;let M=[];for(let e=0;e<90;e++)M.push({x:-350+f()*900,off:(f()-.5)*26,speed:.6+f()*.5,ph:f()*10});t.add(te,j);let N=new xe,ne=new p,re=new n,ie=new I,ae=new I(1,1,1);d.push((e,t)=>{for(let n=0;n<90;n++){let r=M[n];r.x+=r.speed*e,r.x>560&&(r.x=-350);let i=Oc(r.x)+r.off*.8+Math.sin(t*.3+r.ph)*.8;ne.setFromEuler(re.set(Math.sin(t*1.3+r.ph)*.05,r.ph,Math.cos(t*1.1+r.ph)*.05)),N.compose(ie.set(r.x,Ec+.02+Math.sin(t*1.7+r.ph)*.03,i),ne,ae),te.setMatrixAt(n,N),j.setMatrixAt(n,N)}te.instanceMatrix.needsUpdate=!0,j.instanceMatrix.needsUpdate=!0});let oe=Ds({vertexColors:!0,roughness:.9,side:2},{amp:.45,key:`mgrass`}),se=new js(Os({blades:12,height:.45,spread:.24,width:.018,lean:.5,colorBase:[.1,.18,.05],colorTip:[.35,.5,.18],seed:41}),oe,{chunk:40,maxDist:90,name:`grass`});for(let e=0;e<16e3;e++){let e=h.min.x-120+f()*(h.max.x-h.min.x+240),t=h.min.z-120+f()*(h.max.z-h.min.z+240),n=i.sample(e,t,_);n.edge<4||Math.abs(t-Oc(e))<24||se.add(e,n.h-.02,t,f()*6.28,.6+f()*.7)}se.build(t),d.push((e,t,n)=>{n&&n.camera&&se.update(n.camera)});let ce=r.cpToS(14.9),P=r.cpToS(2.6),le=0;for(let e of[-1,1])Ws(r,ce,P,7.2,e,6.2,(t,n,i)=>{if(Math.abs(r.deltaS(i,0))<9||!Fc(l,`createYatai`))return;let a=Ic[le%Ic.length];if(le++,b(`yatai_`+a,()=>l.createYatai({type:a,lit:!0,seed:le%3}),t.x,t.z,x(n,e)),C.add(t.clone().add(new I(0,2.6,0)).addScaledVector(n.right,-e*1.2),{intensity:45}),Fc(l,`createFestivalPerson`)&&le%2==0)for(let r=0;r<3;r++){let r=t.clone().addScaledVector(n.right,-e*(1.8+f()*.6)).addScaledVector(n.tan,(f()-.5)*5),i=Math.floor(f()*8);b(`person`+i,()=>l.createFestivalPerson({seed:i}),r.x,r.z,x(n,-e)+(f()-.5)*1.5+Math.PI,1,{collide:!1})}});if(Fc(l,`createLanternString`)){let e=new W,n=0;Ws(r,ce,P,13,1,0,(t,r,i)=>{let a=r.width+4.2,o=r.pos.clone().addScaledVector(r.right,-a),s=r.pos.clone().addScaledVector(r.right,a);o.y=y(o.x,o.z)+6.2,s.y=y(s.x,s.z)+6.2;try{e.add(l.createLanternString({a:o.toArray(),b:s.toArray(),count:9,sag:1.2,colors:[`red`,`white`,`red`],texts:[`祭`,`祭`,`夏`],seed:n++}))}catch{}for(let e of[o,s])b(`lpole`,()=>{let e=new W,t=new U(new bt(.1,.12,6.6,8),new R({color:4863270,roughness:.9}));return t.position.y=3.3,t.castShadow=!0,e.add(t),e},e.x,e.z,0,1,{collide:!1});C.add(r.pos.clone().setY(r.pos.y+5),{intensity:45,color:16751178})}),Rc(e,t)}if(Fc(l,`createNobori`)){let e=[`祭`,`花火大会`,`盆踊り`,`かき氷`],t=0;for(let n of[-1,1])Ws(r,ce,P,21,n,3.8,(r,i)=>{let a=e[t++%e.length];b(`nobori`+a,()=>l.createNobori({text:a,seed:t}),r.x,r.z,x(i,n),1,{collide:!1})})}if(Fc(l,`createMachiya`)){let e=0;Ws(r,ce,P,10,-1,16,(t,n)=>{let r=e++%4;b(`machiyaL`+r,()=>l.createMachiya({lit:!0,seed:r}),t.x,t.z,x(n,-1))}),Ws(r,ce,P,12,1,16,(t,n)=>{if(Math.abs(t.z-Oc(t.x))<28)return;let r=e++%4;b(`machiyaR`+r,()=>l.createMachiya({lit:!0,seed:r}),t.x,t.z,x(n,1))})}let ue=new I(150,0,-108);if(ue.y=y(ue.x,ue.z),Fc(l,`createYagura`)){let e=.3;b(`yagura`,()=>l.createYagura({seed:1,lit:!0}),ue.x,ue.z,e),m.add(ue.x,ue.z,3.5),C.add(ue.clone().add(new I(0,7,0)),{intensity:120,color:16751178});let t=null;try{t=l.createYagura({seed:1,lit:!0}).userData.stringEnds}catch{t=null}for(let n of t||[]){let t=new I(n.x??n[0],0,n.z??n[2]).applyAxisAngle(new I(0,1,0),e),r=ue.x+t.x,i=ue.z+t.z;b(`ypole`,()=>{let e=new W,t=new U(new bt(.09,.11,2.7,8),new R({color:4863270,roughness:.9}));return t.position.y=1.35,t.castShadow=!0,e.add(t),e},r,i,0,1),m.add(r,i,.3)}}if(Fc(l,`createFestivalCrowd`))for(let e=0;e<10;e++){let t=e/10*Math.PI*2,n=ue.x+Math.cos(t)*9,r=ue.z+Math.sin(t)*9;b(`crowd`+e%3,()=>l.createFestivalCrowd({count:6,radius:2.4,seed:e%3}),n,r,-t+Math.PI/2,1,{collide:!1})}if(Fc(l,`createTaiko`)&&b(`taiko`,()=>l.createTaiko({seed:2}),ue.x+13,ue.z+2,.4),Fc(l,`createChochin`))for(let e of r.bridges)for(let t of[-1,1]){Ws(r,e.s0-1,e.s1+1,5,t,.35,(e,n)=>{let r=n.pos.y+1.9;b(`bridgeChochin`,()=>l.createChochin({color:`red`,text:`祭`,lit:!0,size:.9,seed:1,detail:`low`}),e.x,e.z,x(n,t),1,{y:r,collide:!1})});let n=r.frameAt((e.s0+e.s1)/2);C.add(n.pos.clone().addScaledVector(n.right,t*(n.width+.5)).setY(n.pos.y+1.8),{intensity:45})}Fc(l,`createWoodenBridgeLanterned`)&&b(`footbridge`,()=>l.createWoodenBridgeLanterned({length:46,width:4,lit:!0,seed:2}),60,Oc(60),0,1,{y:.9,collide:!1});let de=r.cpToS(6.3),fe=r.cpToS(9.4);if(Fc(l,`createRyokan`)){let e=0;for(let t of[-1,1])Ws(r,de,fe,19,t,13,(n,r)=>{if(Math.abs(n.z-Oc(n.x))<30)return;let i=e++%3;b(`ryokan`+i,()=>l.createRyokan({floors:2+i%2,lit:!0,seed:i}),n.x,n.z,x(r,t)),C.add(n.clone().setY(y(n.x,n.z)+3).addScaledVector(r.right,-t*5),{intensity:50})})}if(Fc(l,`createStreetLamp`))for(let e of[-1,1])Ws(r,de,fe,16,e,3.8,(t,n)=>b(`lamp`,()=>l.createStreetLamp({lit:!0,seed:1}),t.x,t.z,x(n,e)));let pe=[];if(Fc(l,`createOnsenSteamVent`))for(let[e,t]of[[6.9,1],[7.6,-1],[8.3,1],[8.9,-1]]){let n=r.frameAt(r.cpToS(e)),i=n.pos.clone().addScaledVector(n.right,t*(n.width+6));b(`vent`,()=>l.createOnsenSteamVent({seed:1}),i.x,i.z,0),pe.push(i.clone().setY(y(i.x,i.z)))}if(Fc(s,`createTorii`)){let e=r.frameAt(r.cpToS(8.5));b(`stoneTorii`,()=>s.createTorii({style:`myojin`,material:`stone`,height:11,span:20.5,plaque:`湯の町`,seed:4}),e.pos.x,e.pos.z,S(e),1,{y:e.pos.y-.2,collide:!1});for(let t of[-1,1]){let n=e.pos.clone().addScaledVector(e.right,t*10.25);m.add(n.x,n.z,.8)}let t=r.frameAt(0);b(`startTorii`,()=>s.createTorii({style:`myojin`,material:`vermilion`,height:11.5,span:21.5,plaque:`ぽんぽこ`,seed:6}),t.pos.x,t.pos.z,S(t),1,{y:t.pos.y-.2,collide:!1});for(let e of[-1,1]){let n=t.pos.clone().addScaledVector(t.right,e*10.75);m.add(n.x,n.z,.8)}}if(Fc(s,`createStoneLantern`))for(let e of[-1,1])Ws(r,r.cpToS(8.6),r.cpToS(9.3),10,e,3.4,(t,n)=>b(`slantern`,()=>s.createStoneLantern({lit:!0,seed:3}),t.x,t.z,x(n,e)));if(Fc(l,`createTakeAkari`)){for(let e of[-1,1])Ws(r,r.cpToS(9.6),r.cpToS(12.2),9,e,1.6,(e,t)=>b(`take`,()=>l.createTakeAkari({count:5,lit:!0,seed:2}),e.x,e.z,f()*6.28,1,{collide:!1}));let e=r.frameAt(r.cpToS(11));C.add(e.pos.clone().setY(e.pos.y+1.5),{intensity:30})}if(Fc(u,`createBambooClump`))for(let[e,t]of[[-160,70],[-150,135],[-95,130],[-170,20],[-55,125]])b(`bamboo`+Math.abs(e)%3,()=>u.createBambooClump({seed:Math.abs(e)%3}),e,t,f()*6.28);if(Fc(s,`createPine`)){let e=0;for(let t=0;t<800&&e<40;t++){let t=h.min.x-90+f()*(h.max.x-h.min.x+180),n=h.min.z-90+f()*(h.max.z-h.min.z+180);i.sample(t,n,_).edge<12||Math.abs(n-Oc(t))<26||(b(`pine`+e%3,()=>s.createPine({seed:e%3}),t,n,f()*6.28,.9+f()*.4),e++)}}if(Fc(u,`createCedar`)){let e=0;for(let t=0;t<2e3&&e<120;t++){let t=-300+f()*650,n=-330+f()*660,r=i.sample(t,n,_);r.edge<16||r.h<6||Math.abs(n-Oc(t))<26||(b(`cedar`+e%4,()=>u.createCedar({seed:e%4}),t,n,f()*6.28,.8+f()*.5),e++)}}for(let[e,t]of[[3,1],[10.9,1],[13.4,1]]){let n=r.frameAt(r.cpToS(e)),i=n.pos.clone().addScaledVector(n.right,-t*(n.width+2));b(`sign`+t,()=>qs(t),i.x,i.z,S(n)+Math.PI,1,{collide:!1})}v.build(t);for(let e of v.colliders)m.add(e.x,e.z,e.r);let me=Hs({radius:2400,step:480,layers:3,minH:110,maxH:300,haze:1383482,color:461332,topColor:1844294,hazeBase:.25,hazeStep:.2,seed:31});me.position.set(Dc[0],-60,Dc[1]),t.add(me);let he=null,F=new c(16777215,0,900,1.2);F.position.set(300,120,0),t.add(F);let ge=a.env.hemi,_e=ge.intensity,L={t:2,flash:0,color:new B,pending:[],timers:new Set},ve=[[1,.35,.3],[1,.8,.3],[.4,.75,1],[.8,.45,1],[.45,1,.55],[1,.55,.85]];return d.push((e,t,n)=>{if(he){if(L.t-=e,L.t<=0){L.t=.6+Math.random()*1.6;let e=new I(140+Math.random()*220,115+Math.random()*70,Oc(260)+(Math.random()-.5)*140),n=ve[Math.floor(Math.random()*ve.length)];L.pending.push({at:t+1.1,pos:e,col:n,style:Math.random()<.3?`willow`:`peony`});for(let t=0;t<18;t++)he.sparks.spawn({x:e.x,y:e.y-70+t*3.6,z:e.z,vy:40,life:.12+t*.05,size:.8,size1:.2,r:1,g:.8,b:.5,a:.9,a1:0,grav:0,stretch:.2})}for(let e=L.pending.length-1;e>=0;e--){let r=L.pending[e];if(t>=r.at){he.firework(r.pos,r.col,r.style),L.flash=1,L.color.setRGB(r.col[0],r.col[1],r.col[2]),F.position.copy(r.pos),F.color.copy(L.color);let t=(n&&n.camera?n.camera.position:r.pos).distanceTo(r.pos),i=Math.min(1.5,t/340),a=Math.max(.15,1-t/700);if(n&&n.audio){let e=setTimeout(()=>{L.timers.delete(e),n.audio.play(`firework`,{volume:a})},i*1e3);L.timers.add(e)}L.pending.splice(e,1)}}L.flash=Math.max(0,L.flash-e*1.8),F.intensity=L.flash*L.flash*3500,ge.intensity=_e+L.flash*.35}}),d.push(e=>{if(he)for(let t of pe)Math.random()<e*6&&he.smoke.spawn({x:t.x+(Math.random()-.5),y:t.y+.4,z:t.z+(Math.random()-.5),vx:.3+Math.random()*.3,vy:1.2+Math.random()*.8,vz:(Math.random()-.5)*.4,life:3.5,size:1.2,size1:5,r:.7,g:.72,b:.78,a:.25,a1:0,drag:.3,vrot:Math.random()-.5})}),d.push((e,t,n)=>{n&&n.camera&&C.update(n.camera,t)}),{update(e,t,n){for(let r of d)r(e,t,n)},attachFX(e){he=e},dispose(){for(let e of L.timers)clearTimeout(e);L.timers.clear(),he=null}}}function Rc(e,t){e.updateMatrixWorld(!0);let n=new Map;e.traverse(e=>{if(!e.isMesh)return;let t=n.get(e.material);t||n.set(e.material,t=[]);let r=e.geometry.index?e.geometry.toNonIndexed():e.geometry.clone();for(let e of Object.keys(r.attributes))[`position`,`normal`,`uv`].includes(e)||r.deleteAttribute(e);r.attributes.uv||r.setAttribute(`uv`,new st(new Float32Array(r.attributes.position.count*2),2)),t.push(r.applyMatrix4(e.matrixWorld))});for(let[e,r]of n){let n=r.reduce((e,t)=>e+t.attributes.position.count,0),i=new we;for(let e of[`position`,`normal`,`uv`]){let t=e===`uv`?2:3,a=new Float32Array(n*t),o=0;for(let t of r)a.set(t.attributes[e].array,o),o+=t.attributes[e].array.length;i.setAttribute(e,new st(a,t))}let a=new U(i,e);a.castShadow=!1,a.receiveShadow=!1,t.add(a)}}var zc=[rc,Cc,{id:`matsuri`,name:`夏祭り花火ナイト`,subtitle:`Natsumatsuri Hanabi Night`,description:`提灯きらめく屋台通りと温泉街。夜空に咲く花火の下、川を和傘でひとっ飛び！`,laps:3,bgm:`matsuri`,ambience:`matsuri`,colors:[`#ff8a3c`,`#3a2a8a`],track:{width:8,wallMargin:12,points:[[-40,1,-45,8.5],[40,1,-45,8.5],[110,1,-46,8.5],[160,1,-66,8.5,.05],[196,1.1,-40,8],[205,1.6,0,7.5],[200,1.1,45,8],[150,1,72,8,.04],[60,1,76,8],[-20,1.4,70,8],[-75,4,95,8],[-120,9,102,8.5,-.06],[-138,11,62,9],[-140,2,-60,9.5],[-115,1,-88,8.5,.05],[-80,1,-62,8.5]],zones:{gaps:[{from:12.3,to:12.82}],bridges:[{from:4.6,to:5.45,style:`red`}],ramps:[{at:{cp:12.3,off:-12},len:12,h:2.4,d0:-8.5,d1:8.5,type:`glide`,launch:10},{at:7.6,len:8,h:1.3,d0:-3.5,d1:3.5,type:`jump`,launch:8.5}],boosts:[{at:1.6,d:0,len:5},{at:8.4,d:-3.5,len:5},{at:10.4,d:0,len:5},{at:14.6,d:3,len:5}],items:[{at:.7},{at:6.6},{at:11.3},{at:14.1}],coins:[{from:1.9,to:2.6,d:3,count:6},{from:7.9,to:8.3,d:0,count:5},{from:9.2,to:9.8,d:-3,count:5},{from:13.2,to:13.8,d:0,count:5},{from:12.36,to:12.76,d:1.5,count:7,h:4,arc:2.5,wave:3}],walls:[{from:15.2,to:2.7,side:`both`,offset:3.2},{from:6.4,to:9.4,side:`both`,offset:3.2},{from:2.7,to:4.5,side:`both`,offset:6}]}},trackStyle:{road:`stone`,roadOpts:{hue:28,rows:12,seed:21,grout:`#3a3631`},roadColor:14209224,roadRoughness:.7,skirtMat:`stoneDark`,texLen:14,tile:4},terrain:{natural:Ac,shoulder:2,blend:8,waterLevelAt:jc,surfaceAt:Mc,colorAt:Nc},terrainMesh:{res:2,margin:100,outer:1600},waterLevelAt:jc,surfaceAt:Mc,shallowWater:`water`,killY:-12,build:Lc,introShots:e=>[{path:{track:e,s0:e.cpToS(.2),s1:e.cpToS(1.7),h:7.8,d:0,ahead:22},dur:3.8,fov:58},{from:[125,5,-26],to:[70,8,-22],look:[320,110,0],lookTo:[300,100,10],dur:3.2,fov:55}],env:{sky:{zenith:264734,horizon:1713744,haze:2894942,ground:526348,sunDir:[.3,.55,-.78],sunColor:0,sunGlow:0,sunDisk:0,cloudCover:.62,cloudSoft:.25,cloudOpacity:.45,cloudLit:3754106,cloudShade:922408,stars:1,moon:1.2,moonDir:[.3,.55,-.78],gradExp:.5,billboards:{count:8,lit:3819638,shade:790564,opacity:.5,minH:200,maxH:420,dist:2300,minW:500,maxW:1e3,rimAmt:.2}},sun:{color:10269951,intensity:.7,shadowFar:140,shadowIntensity:.7},hemi:{sky:2899056,ground:1314314,intensity:.46},headlights:!0,fog:{color:922928,density:.0017,sunColor:2503006},envIntensity:.25,look:{exposure:1.2,bloomStrength:.95,bloomRadius:.62,bloomThreshold:.75,saturation:1.15,contrast:1.06,tint:[1,.98,1.04],lift:[.005,.005,.02],vignette:.45,grain:.022}}}],Bc={title:{sky:{zenith:3825566,horizon:15905402,haze:16756848,sunDir:[-.7,.18,-.7],sunColor:16757854,sunGlow:1.3,sunDisk:14,cloudCover:.55,cloudLit:16763296,cloudShade:9072518,gradExp:.45},sun:[16760960,3.6],hemi:[9085910,5915696,.7],env:.7,exposure:1.05,lanterns:0,petals:.6,fireworks:!1},inaka:{sky:{zenith:3825566,horizon:15905402,haze:16756848,sunDir:[-.7,.18,-.7],sunColor:16757854,sunGlow:1.3,sunDisk:14,cloudCover:.55,cloudLit:16763296,cloudShade:9072518,gradExp:.45},sun:[16760960,3.6],hemi:[9085910,5915696,.7],env:.7,exposure:1.05,lanterns:0,petals:.2,fireworks:!1},sakura:{sky:{zenith:3108816,horizon:13625087,haze:15397631,sunDir:[.4,.75,.5],sunColor:16773848,sunGlow:.8,sunDisk:10,cloudCover:.5,cloudLit:16777215,cloudShade:11122896,gradExp:.6},sun:[16773340,3.4],hemi:[12375807,6978122,1],env:1,exposure:1,lanterns:0,petals:1.4,fireworks:!1},matsuri:{sky:{zenith:330527,horizon:1845842,haze:2764896,ground:657936,sunDir:[.3,.5,-.8],sunColor:0,sunGlow:0,sunDisk:0,cloudCover:.62,cloudOpacity:.5,cloudLit:3820152,cloudShade:1053738,stars:1,moon:1,moonDir:[.35,.45,-.8],gradExp:.5},sun:[9349352,.6],hemi:[3820160,1314314,.55],env:.35,exposure:1.15,lanterns:1,petals:0,fireworks:!0}},Vc=class{constructor(e){this.game=e,this.scene=new vt,this.camera=new Ce(38,innerWidth/innerHeight,.1,3e3),this.camera.layers.enable(1),this.turntable=new W,this.scene.add(this.turntable),this.karts=new Map,this.current=null,this.time=0,this.orbit=0,this.fx=new qo(this.scene),this.lights=new W,this.scene.add(this.lights),this.sun=new te(16777215,3),this.sun.castShadow=!0,this.sun.shadow.mapSize.set(2048,2048);let t=this.sun.shadow.camera;t.left=t.bottom=-14,t.right=t.top=14,t.near=1,t.far=80,this.sun.shadow.bias=-5e-4,this.sun.shadow.normalBias=.03,this.scene.add(this.sun,this.sun.target),this.hemi=new de(16777215,4473924,1),this.scene.add(this.hemi),this.lanternLight=new c(16752720,0,30,2),this.lanternLight.position.set(-3,3.2,-2),this.scene.add(this.lanternLight),this._buildGround(),this.mood=null,this.setMood(`title`)}_buildGround(){let e=new U(new bt(13,13.4,.6,64),new R({color:6257978,roughness:1}));e.position.y=-.3,e.receiveShadow=!0;let t=new U(new bt(13.6,14.2,1.4,64),new R({color:9078396,roughness:.95}));t.position.y=-1,t.receiveShadow=!0;let n=new U(new bt(2.6,2.7,.18,48),new R({color:12169892,roughness:.7}));n.position.y=.05,n.receiveShadow=!0;let r=new U(new b(2.62,.05,8,64),new R({color:14725194,metalness:1,roughness:.3}));r.rotation.x=Math.PI/2,r.position.y=.15,this.scene.add(e,t,n,r);let i=new U(new et(1500,48).rotateX(-Math.PI/2),new R({color:4151852,roughness:1}));i.position.y=-3,this.scene.add(i),this.farGround=i}async decorate(){let e=await Zs(()=>import(`./shrine-XOlbh7ba.js`),__vite__mapDeps([3,1,2]),import.meta.url).catch(()=>({})),t=await Zs(()=>import(`./festival-C4MIQmKz.js`),__vite__mapDeps([4,1,2]),import.meta.url).catch(()=>({})),n=new Rs({chunk:1e3}),r=(e,t,r,i,a=0,o=1)=>n.add(e,t,{x:r,y:0,z:i,rotY:a,scale:o,collide:!1});if(e.createTorii&&r(`torii`,()=>e.createTorii({style:`myojin`,material:`vermilion`,height:6.5,span:5.5,plaque:`ぽんぽこ`,seed:2}),0,-8.5,0),e.createSakuraTree&&(r(`sakuraA`,()=>e.createSakuraTree({seed:3,size:1.1}),-8,-4,.4),r(`sakuraB`,()=>e.createSakuraTree({seed:7,size:.9}),8.5,-5.5,1.3)),e.createStoneLantern&&(r(`lanternL`,()=>e.createStoneLantern({lit:!0,seed:1}),-3.6,-6.8,.3),r(`lanternL`,()=>e.createStoneLantern({lit:!0,seed:1}),3.6,-6.8,-.3)),e.createPine&&r(`pine`,()=>e.createPine({seed:2}),10,4,2.2,.8),n.build(this.scene),this.nightGroup=new W,t.createLanternString)try{this.nightGroup.add(t.createLanternString({a:[-9,5.2,-6],b:[9,5.2,-6],count:9,sag:1,colors:[`red`,`white`],texts:[`祭`]})),this.nightGroup.add(t.createLanternString({a:[-10,4.6,1],b:[-3,5.8,-9],count:5,sag:.6,colors:[`red`],texts:[`祭`]}))}catch(e){console.warn(e)}this.scene.add(this.nightGroup),this.nightGroup.visible=this.mood===`matsuri`}setMood(e){let t=Bc[e]||Bc.title;if(this.mood===e)return;this.mood=e,this.sky&&(this.scene.remove(this.sky.group),this.sky.dome.material.dispose()),this.sky=new mo({...t.sky,billboards:{count:8,lit:t.sky.cloudLit,shade:t.sky.cloudShade,opacity:e===`matsuri`?.35:.9,minH:120,maxH:320,dist:1800,minW:400,maxW:800}}),this.scene.add(this.sky.group);let n=this.sky.sunDir;this.sun.position.copy(n).multiplyScalar(40),this.sun.color.set(t.sun[0]),this.sun.intensity=t.sun[1],this.hemi.color.set(t.hemi[0]),this.hemi.groundColor.set(t.hemi[1]),this.hemi.intensity=t.hemi[2],this.envTex&&this.envTex.dispose(),this.envTex=this.sky.buildEnvironment(this.game.renderer.renderer),this.scene.environment=this.envTex,this.scene.environmentIntensity=t.env,this.scene.fog=new y(new B(t.sky.horizon),e===`matsuri`?.004:.0022),la.sunDirWorld.copy(n),la.setSunColor(new B(t.sky.haze)),this.farGround.material.color.set(e===`matsuri`?1317396:e===`sakura`?6261306:4939564),this.lanternLight.intensity=t.lanterns?30:0,this.nightGroup&&(this.nightGroup.visible=e===`matsuri`),this.moodDef=t,this.game.renderer.renderer.toneMappingExposure=t.exposure,this.game.renderer.setLook({exposure:t.exposure,bloomStrength:e===`matsuri`?.9:.45,bloomThreshold:e===`matsuri`?.8:.95,vignette:.45,saturation:1.1,contrast:1.05})}showKart(e){let t=this.game.kartApi;if(!this.karts.has(e)){let n=null;try{t&&t.createKartModel&&(n=t.createKartModel(e))}catch(e){console.warn(e)}if(!n){let e=new W;e.add(new U(new Qe(1.3,.5,1.9),new R({color:16746544}))),n={root:e,animate(){}}}n.root.traverse(e=>{e.isMesh&&(e.castShadow=!0)}),this.karts.set(e,n)}this.current&&this.turntable.remove(this.current.root),this.current=this.karts.get(e),this.turntable.add(this.current.root),this.current.root.position.set(0,.14,0),this._pop=0}hideKart(){this.current&&this.turntable.remove(this.current.root),this.current=null}update(e,t){if(this.time+=e,this.turntable.rotation.y+=e*.55,this.current){this._pop=Math.min(1,(this._pop??1)+e*4);let t=.6+.4*Hc(this._pop);this.current.root.scale.setScalar(t);try{this.current.animate(e,{speed:0,steer:Math.sin(this.time*.8)*.4,driftDir:0,driftLevel:0,boosting:!1,airborne:!1,gliding:!1,trickT:-1,trickType:`flip`,squash:0,spinOut:!1,time:this.time})}catch{}}let n=innerWidth,r=innerHeight;this.orbit+=e*.05;let i=.55+Math.sin(this.orbit)*.25,a=t?8.6*Math.min(1.6,Math.max(.8,r/Math.max(200,t.height)*.62)):16,o=t?.8:2.4;this.camera.position.set(Math.sin(i)*a,1.6+a*.16,Math.cos(i)*a),this.camera.lookAt(0,o,t?0:-2.5),this.camera.aspect=n/r,t?this.camera.setViewOffset(n,r,n/2-t.cx,r/2-t.cy,n,r):this.camera.clearViewOffset(),this.camera.updateProjectionMatrix(),this.sky.update(e,this.camera);let s=this.moodDef;if(s.petals>0&&Math.random()<e*30*s.petals&&this.fx.petals.spawn({x:(Math.random()-.5)*24,y:7+Math.random()*4,z:(Math.random()-.5)*20,vx:.6+Math.random()*.6,vy:-.8,vz:.2,life:8,size:.12,size1:.12,r:1,g:.78,b:.85,a:1,a1:.9,drag:.4,vrot:(Math.random()-.5)*6,flutter:2.5,floorY:.02}),s.fireworks){if(this._fwT=(this._fwT??1)-e,this._fwT<=0){this._fwT=.8+Math.random()*1.4;let e=[[1,.4,.3],[1,.85,.3],[.4,.8,1],[.8,.5,1],[.5,1,.6]],t=new I((Math.random()-.5)*160,50+Math.random()*40,-120-Math.random()*80);this.fx.firework(t,e[Math.floor(Math.random()*e.length)],Math.random()<.3?`willow`:`peony`),this._flash=1,this.game.audio.play(`firework`,{volume:.35})}this._flash=Math.max(0,(this._flash||0)-e*2.5),this.hemi.intensity=s.hemi[2]+this._flash*.6}this.fx.update(e)}};function Hc(e){return 1+2.70158*(e-1)**3+1.70158*(e-1)**2}function Uc(e,{ui:t,audio:n,characters:r,stages:i}){let a=new Vc(e);a.decorate();let o={characterId:r[0].id,courseId:i[0].id,difficulty:`100cc`};try{let e=JSON.parse(localStorage.getItem(`ponpoko.prefs`)||`{}`);e.characterId&&r.find(t=>t.id===e.characterId)&&(o.characterId=e.characterId),e.courseId&&i.find(t=>t.id===e.courseId)&&(o.courseId=e.courseId),e.difficulty&&(o.difficulty=e.difficulty)}catch{}let s=()=>{try{localStorage.setItem(`ponpoko.prefs`,JSON.stringify(o))}catch{}};n&&(t.onSound=e=>n.play(e));let c=()=>{e.renderer.setScene(a.scene,a.camera),e.renderer.scenePass.beforeRender=null,a.setMood(a.mood||`title`);let n=Bc[a.mood];e.renderer.setLook({exposure:n.exposure,bloomStrength:a.mood===`matsuri`?.9:.45,bloomThreshold:a.mood===`matsuri`?.8:.95,vignette:.45}),e.menuRender=n=>{a.update(n,t.getPreviewRect?t.getPreviewRect():null),la.updateCamera(a.camera),e.renderer.render(n)}},l=()=>{a.setMood(`title`),a.showKart(o.characterId),t.hideHUD(),t.showTitle({onStart:()=>{n&&n.unlock().then(()=>n.playMusic(`select`,{fadeIn:.8})),u()}}),n&&n.playMusic(`title`,{fadeIn:1})},u=()=>{a.setMood(`title`),a.showKart(o.characterId),t.showCharacterSelect({characters:r,selectedId:o.characterId,onHover:e=>a.showKart(e),onConfirm:e=>{o.characterId=e,s(),d()},onBack:()=>l()})},d=()=>{a.showKart(o.characterId),a.setMood(o.courseId),t.showCourseSelect({courses:i.map(e=>({id:e.id,name:e.name,subtitle:e.subtitle,description:e.description,colors:e.colors||[`#e0b04a`,`#d8401f`],laps:e.laps??3})),selectedId:o.courseId,difficulty:o.difficulty,onHover:e=>a.setMood(e),onConfirm:({courseId:t,difficulty:n})=>{o.courseId=t,o.difficulty=n||o.difficulty,s(),e.menuRender=null,e.startRace({courseId:o.courseId,characterId:o.characterId,difficulty:o.difficulty})},onBack:()=>u()})};return e.onQuit=()=>{t.hideHUD(),c(),n&&n.playMusic(`select`,{fadeIn:.8}),d()},e.onTitle=()=>{c(),l()},Zs(()=>import(`./icons-BC_Gy1-4.js`).then(async e=>{let[n,r]=await Promise.all([e.renderItemIcons?e.renderItemIcons():null,e.renderPortraits?e.renderPortraits():null]);t.setAssets({itemIcons:n||void 0,portraits:r||void 0})}),__vite__mapDeps([5,1]),import.meta.url).catch(e=>console.warn(`icons unavailable`,e)),c(),l(),a}var Wc=[{id:`tanuki`,name:`たぬき`,kanji:`狸`,romaji:`Tanuki`,description:`葉っぱ一枚でなんにでも化ける、ぽんぽこカートの看板娘ならぬ看板狸！`,colors:{body:15760418,accent:8014636,trim:15719606,fur:9402208,umbrella:11031850},stats:{speed:3,accel:3,handling:3,weight:3}},{id:`kitsune`,name:`きつね`,kanji:`狐`,romaji:`Kitsune`,description:`お稲荷さんの使い。コーナーを狐火のようにすり抜ける。`,colors:{body:14828318,accent:15460062,trim:15251018,fur:15921388,umbrella:14168604},stats:{speed:3,accel:4,handling:4,weight:1}},{id:`neko`,name:`ねこ`,kanji:`猫`,romaji:`Neko`,description:`鈴を鳴らして気まぐれドライブ。三毛猫はとにかく小回りがきく！`,colors:{body:16742568,accent:16764730,trim:15919322,fur:16249320,umbrella:15750543},stats:{speed:2,accel:4,handling:5,weight:1}},{id:`shiba`,name:`しば`,kanji:`犬`,romaji:`Shiba`,description:`まっすぐ一直線！まろ眉がチャームポイントの柴犬レーサー。`,colors:{body:3109592,accent:15264752,trim:15906122,fur:14256708,umbrella:2512824},stats:{speed:4,accel:3,handling:3,weight:2}},{id:`usagi`,name:`うさぎ`,kanji:`兎`,romaji:`Usagi`,description:`月からやってきた餅つき名人。ぴょんとダッシュで一気に加速！`,colors:{body:12164338,accent:8081366,trim:15918316,fur:16447220,umbrella:9067744},stats:{speed:3,accel:5,handling:3,weight:1}},{id:`kappa`,name:`かっぱ`,kanji:`河`,romaji:`Kappa`,description:`頭のお皿の水が命。好物はもちろん、きゅうり！`,colors:{body:6009930,accent:3112758,trim:14478269,fur:7454556,umbrella:3115582},stats:{speed:3,accel:3,handling:4,weight:2}},{id:`tengu`,name:`てんぐ`,kanji:`天`,romaji:`Tengu`,description:`山の神通力で風を呼ぶ。鼻の高さと最高速には自信あり。`,colors:{body:2762801,accent:14856524,trim:13185322,fur:14170412,umbrella:2828596},stats:{speed:5,accel:2,handling:2,weight:3}},{id:`oni`,name:`おに`,kanji:`鬼`,romaji:`Oni`,description:`力持ちでやさしい青鬼。ぶつかり合いなら誰にも負けない！`,colors:{body:16762410,accent:4024524,trim:2828848,fur:6000608,umbrella:15774750},stats:{speed:4,accel:1,handling:2,weight:5}}];function Gc(e){return Wc.find(t=>t.id===e)||Wc[0]}Wc.map(e=>e.id);var Kc=new I;function qc(e,t,n,r,i,a){let o=2*Math.PI*i/4,s=Math.max(a-2*i,0),c=Math.PI/4;Kc.copy(t),Kc[r]=0,Kc.normalize();let l=.5*o/(o+s),u=1-Kc.angleTo(e)/c;return Math.sign(Kc[n])===1?u*l:s/(o+s)+l+l*(1-u)}var Jc=class e extends Qe{constructor(e=1,t=1,n=1,r=2,i=.1){let a=r*2+1;if(i=Math.min(e/2,t/2,n/2,i),super(1,1,1,a,a,a),this.type=`RoundedBoxGeometry`,this.parameters={width:e,height:t,depth:n,segments:r,radius:i},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let s=new I,c=new I,l=new I(e,t,n).divideScalar(2).subScalar(i),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,p=u.length/6,m=new I,h=.5/a;for(let r=0,a=0;r<u.length;r+=3,a+=2)switch(s.fromArray(u,r),c.copy(s),c.x-=Math.sign(c.x)*h,c.y-=Math.sign(c.y)*h,c.z-=Math.sign(c.z)*h,c.normalize(),u[r+0]=l.x*Math.sign(s.x)+c.x*i,u[r+1]=l.y*Math.sign(s.y)+c.y*i,u[r+2]=l.z*Math.sign(s.z)+c.z*i,d[r+0]=c.x,d[r+1]=c.y,d[r+2]=c.z,Math.floor(r/p)){case 0:m.set(1,0,0),f[a+0]=qc(m,c,`z`,`y`,i,n),f[a+1]=1-qc(m,c,`y`,`z`,i,t);break;case 1:m.set(-1,0,0),f[a+0]=1-qc(m,c,`z`,`y`,i,n),f[a+1]=1-qc(m,c,`y`,`z`,i,t);break;case 2:m.set(0,1,0),f[a+0]=1-qc(m,c,`x`,`z`,i,e),f[a+1]=qc(m,c,`z`,`x`,i,n);break;case 3:m.set(0,-1,0),f[a+0]=1-qc(m,c,`x`,`z`,i,e),f[a+1]=1-qc(m,c,`z`,`x`,i,n);break;case 4:m.set(0,0,1),f[a+0]=1-qc(m,c,`x`,`y`,i,e),f[a+1]=1-qc(m,c,`y`,`x`,i,t);break;case 5:m.set(0,0,-1),f[a+0]=qc(m,c,`x`,`y`,i,e),f[a+1]=1-qc(m,c,`y`,`x`,i,t)}}static fromJSON(t){return new e(t.width,t.height,t.depth,t.segments,t.radius)}},Yc=class extends we{constructor(e=new U,t=new I,r=new n,i=new I(1,1,1)){super();let a=[],o=[],s=[],c=new I,l=new H().getNormalMatrix(e.matrixWorld),u=new xe;u.makeRotationFromEuler(r),u.setPosition(t);let d=new xe;d.copy(u).invert(),f(),this.setAttribute(`position`,new M(a,3)),this.setAttribute(`uv`,new M(s,2)),o.length>0&&this.setAttribute(`normal`,new M(o,3));function f(){let t=[],n=new I,r=new I,l=e.geometry,d=l.attributes.position,f=l.attributes.normal;if(l.index!==null){let e=l.index;for(let i=0;i<e.count;i++)n.fromBufferAttribute(d,e.getX(i)),f?(r.fromBufferAttribute(f,e.getX(i)),p(t,n,r)):p(t,n)}else{if(d===void 0)return;for(let e=0;e<d.count;e++)n.fromBufferAttribute(d,e),f?(r.fromBufferAttribute(f,e),p(t,n,r)):p(t,n)}t=m(t,c.set(1,0,0)),t=m(t,c.set(-1,0,0)),t=m(t,c.set(0,1,0)),t=m(t,c.set(0,-1,0)),t=m(t,c.set(0,0,1)),t=m(t,c.set(0,0,-1));for(let e=0;e<t.length;e++){let n=t[e];s.push(.5+n.position.x/i.x,.5+n.position.y/i.y),n.position.applyMatrix4(u),a.push(n.position.x,n.position.y,n.position.z),n.normal!==null&&o.push(n.normal.x,n.normal.y,n.normal.z)}}function p(t,n,r=null){n.applyMatrix4(e.matrixWorld),n.applyMatrix4(d),r?(r.applyNormalMatrix(l),t.push(new Xc(n.clone(),r.clone()))):t.push(new Xc(n.clone()))}function m(e,t){let n=[],r=.5*Math.abs(i.dot(t));for(let i=0;i<e.length;i+=3){let a=0,o,s,c,l,u=e[i+0].position.dot(t)-r,d=e[i+1].position.dot(t)-r,f=e[i+2].position.dot(t)-r,p=u>0,m=d>0,g=f>0;switch(a=+!!p+ +!!m+ +!!g,a){case 0:n.push(e[i]),n.push(e[i+1]),n.push(e[i+2]);break;case 1:if(p&&(o=e[i+1],s=e[i+2],c=h(e[i],o,t,r),l=h(e[i],s,t,r)),m){o=e[i],s=e[i+2],c=h(e[i+1],o,t,r),l=h(e[i+1],s,t,r),n.push(c),n.push(s.clone()),n.push(o.clone()),n.push(s.clone()),n.push(c.clone()),n.push(l);break}g&&(o=e[i],s=e[i+1],c=h(e[i+2],o,t,r),l=h(e[i+2],s,t,r)),n.push(o.clone()),n.push(s.clone()),n.push(c),n.push(l),n.push(c.clone()),n.push(s.clone());break;case 2:p||(o=e[i].clone(),s=h(o,e[i+1],t,r),c=h(o,e[i+2],t,r),n.push(o),n.push(s),n.push(c)),m||(o=e[i+1].clone(),s=h(o,e[i+2],t,r),c=h(o,e[i],t,r),n.push(o),n.push(s),n.push(c)),g||(o=e[i+2].clone(),s=h(o,e[i],t,r),c=h(o,e[i+1],t,r),n.push(o),n.push(s),n.push(c))}}return n}function h(e,t,n,r){let i=e.position.dot(n)-r,a=i/(i-(t.position.dot(n)-r)),o=new I(e.position.x+a*(t.position.x-e.position.x),e.position.y+a*(t.position.y-e.position.y),e.position.z+a*(t.position.z-e.position.z)),s=null;return e.normal!==null&&t.normal!==null&&(s=new I(e.normal.x+a*(t.normal.x-e.normal.x),e.normal.y+a*(t.normal.y-e.normal.y),e.normal.z+a*(t.normal.z-e.normal.z))),new Xc(o,s)}}},Xc=class{constructor(e,t=null){this.position=e,this.normal=t}clone(){let e=this.position.clone(),t=this.normal===null?null:this.normal.clone();return new this.constructor(e,t)}},Zc=Math.PI*2,{clamp:Qc,lerp:$c}=ot,el=32,tl=11,nl=1.62,rl=2,il=.045,al=.72,ol=.78,sl=.032,cl=new Map,ll=new Map;function ul(e,t){if(!cl.has(e)){let n=t();n.name=`glider.`+e,cl.set(e,n)}return cl.get(e)}var dl=e=>`#`+new B(e).getHexString();function fl(e){let t=`janome`+e;if(ll.has(t))return ll.get(t);let n=document.createElement(`canvas`);n.width=512,n.height=64;let r=n.getContext(`2d`),i=new B(e).clone().multiplyScalar(.7),a=(e,t,n)=>{r.fillStyle=n,r.fillRect(e*512,0,(t-e)*512+1,64)};a(0,1,dl(e)),a(0,.1,`#2d2524`),a(.1,.115,`#c9a45a`),a(.43,.63,`#f6eedb`),a(.43,.437,`#`+i.getHexString()),a(.623,.63,`#`+i.getHexString()),a(.955,1,`#`+i.getHexString());let o=5,s=()=>(o=o*16807%2147483647)/2147483647;for(let e=0;e<500;e++)r.fillStyle=`rgba(255,255,255,${s()*.06})`,r.fillRect(s()*512,s()*64,1+s()*6,1);let c=new ft(n);return c.colorSpace=oe,c.anisotropy=8,ll.set(t,c),c}function pl(){if(ll.has(`thread`))return ll.get(`thread`);let e=document.createElement(`canvas`);e.width=256,e.height=32;let t=e.getContext(`2d`),n=[`#e8433a`,`#f2c230`,`#2f9a5a`,`#f7f3ea`,`#3a62c8`,`#e8433a`,`#f7f3ea`,`#b8409a`];for(let e=0;e<32;e++)t.fillStyle=n[e%n.length],t.fillRect(0,e,256,1);for(let e=0;e<256;e+=8)t.fillStyle=`rgba(0,0,0,0.18)`,t.fillRect(e,0,1,32);let r=new ft(e);return r.colorSpace=oe,r.wrapS=Re,r.repeat.set(8,1),ll.set(`thread`,r),r}var ml=null;function hl(){if(ml)return ml;let e=new bt(.018,.02,1.88,12);e.translate(0,1.06,0);let t=new bt(.027,.03,.34,14);t.translate(0,.05,0);let n=[];for(let e=0;e<5;e++){let t=new b(.03,.006,4,12);t.rotateX(Math.PI/2),t.translate(0,-.08+e*.065,0),n.push(t)}let i=new r(.032,12,8);i.translate(0,-.12,0);let a=new bt(il,il*1.1,.07,16);a.translate(0,1.99,0);let o=new L(.1,.07,20);o.translate(0,2.055,0);let s=new r(.022,10,8);s.translate(0,2.1,0);let c=new bt(.038,.042,.1,14);return ml={wood:ut([e,a],!1),lacquer:ut([t,i,s],!1),dark:ut([...n,o],!1),runner:c},ml}function gl(e=`tanuki`){let t=Gc(e),n=t.colors.umbrella??t.colors.accent,r=ul(`paper`+n,()=>new R({map:fl(n),side:2,roughness:.55,metalness:0,emissive:16777215,emissiveMap:fl(n),emissiveIntensity:.08})),i=ul(`bamboo`,()=>new R({color:13806962,roughness:.55})),a=ul(`wood`,()=>new R({color:10119746,roughness:.5})),o=ul(`lacquer`,()=>new Ae({color:9051932,roughness:.3,clearcoat:1,clearcoatRoughness:.1})),s=ul(`dark`,()=>new R({color:2958628,roughness:.6})),c=ul(`thread`,()=>new R({map:pl(),side:2,roughness:.8})),l=new W;l.name=`glider`;let u=new W;u.rotation.x=.12,l.add(u);let d=new W;u.add(d);let f=hl(),p=(e,t,n=!0)=>{let r=new U(e,t);return r.castShadow=n,r.receiveShadow=!0,d.add(r),r};p(f.wood,a),p(f.lacquer,o),p(f.dark,s,!1);let m=p(f.runner,a),h=1280,g=new Float32Array(h*9),_=new Float32Array(h*6),v=new we;v.setAttribute(`position`,new st(g,3)),v.setAttribute(`uv`,new st(_,2)),v.setAttribute(`normal`,new st(new Float32Array(h*9),3));let y=p(v,r),b=new Float32Array(3456),x=new we;x.setAttribute(`position`,new st(b,3)),x.setAttribute(`normal`,new st(new Float32Array(3456),3));let S=p(x,i,!1),C=new Float32Array(576),w=new Float32Array(384),T=new we;T.setAttribute(`position`,new st(C,3)),T.setAttribute(`uv`,new st(w,2)),T.setAttribute(`normal`,new st(new Float32Array(576),3));let E=p(T,c,!1);{let e=0;for(let t=0;t<64;t++)for(let t=0;t<10;t++){let n=D(t),r=D(t+1),i=[[n,.5],[r,.5],[r,.5],[n,.5],[r,.5],[n,.5]];for(let[t,n]of i)_[e++]=t,_[e++]=n}e=0;for(let t=0;t<el;t++){let n=t/el,r=(t+1)/el,i=[[n,0],[r,0],[r,1],[n,0],[r,1],[n,1]];for(let[t,n]of i)w[e++]=t,w[e++]=n}}function D(e){return .035+e/10*.965}let O=[];for(let e=0;e<el;e++){O.push([]);for(let t=0;t<tl;t++)O[e].push(new I)}let k=[];for(let e=0;e<el;e++){k.push([]);for(let t=0;t<tl;t++)k[e].push(new I)}let A=new I,ee=new I,te=new I;function j(e,t,n,r,i,a,o){let s=A.subVectors(r,n).normalize(),c=ee.crossVectors(s,o).normalize();c.lengthSq()<1e-6&&c.set(1,0,0);let l=te.crossVectors(c,s).normalize(),u=[];for(let e=0;e<3;e++){let t=e/3*Zc+Math.PI/2;u.push([Math.cos(t),Math.sin(t)])}let d=(e,t,n)=>[e.x+(c.x*u[n][0]+l.x*u[n][1])*t,e.y+(c.y*u[n][0]+l.y*u[n][1])*t,e.z+(c.z*u[n][0]+l.z*u[n][1])*t],f=t;for(let t=0;t<3;t++){let o=(t+1)%3,s=d(n,i,t),c=d(n,i,o),l=d(r,a,t),u=d(r,a,o);for(let t of[s,l,u,s,u,c])e[f++]=t[0],e[f++]=t[1],e[f++]=t[2]}return f}let M=-1;function N(e){let t=Qc(e,0,1);if(l.visible=t>.002,Math.abs(t-M)<1e-4)return;M=t;let n=$c(.25,1,1-(1-Qc(t/.3,0,1))**3);d.scale.setScalar(n);let r=1-(1-Qc((t-.08)/.92,0,1))**2.2,i=$c(ot.degToRad(86),ot.degToRad(17),r),a=(1-r)*.6,o=.07*r;for(let e=0;e<el;e++){let t=e/el*Zc,n=Math.cos(t),r=Math.sin(t);for(let t=0;t<tl;t++){let a=D(t),s=il+Math.cos(i)*nl*a,c=rl-Math.sin(i)*nl*a-o*a*a;O[e][t].set(n*s,c,r*s)}}for(let e=0;e<el;e++){let t=(e+1)%el;for(let n=0;n<tl;n++){let i=k[e][n].addVectors(O[e][n],O[t][n]).multiplyScalar(.5),o=Math.hypot(i.x,i.z),s=1-a*(.3+.7*D(n)),c=Math.max(.02,o*s);o>1e-5&&(i.x*=c/o,i.z*=c/o),i.y+=.012*r*D(n)}}let s=0,c=e=>{g[s++]=e.x,g[s++]=e.y,g[s++]=e.z};for(let e=0;e<el;e++){let t=(e+1)%el;for(let n=0;n<2;n++){let r=n===0?O[e]:k[e],i=n===0?k[e]:O[t];for(let e=0;e<10;e++)c(r[e]),c(r[e+1]),c(i[e+1]),c(r[e]),c(i[e+1]),c(i[e])}}v.attributes.position.needsUpdate=!0,v.computeVertexNormals(),v.computeBoundingSphere();let u=il+Math.cos(i)*al,f=rl-Math.sin(i)*al-o*(al/nl)**2,p=u-sl,h=f-Math.sqrt(Math.max(1e-4,ol*ol-p*p));m.position.y=h;let _=0,w=new I(0,1,0),A=new I,ee=new I;for(let e=0;e<el;e++){let t=e/el*Zc,n=Math.cos(t),r=Math.sin(t),i=O[e][10];A.set(n*il,1.988,r*il),ee.copy(i).addScaledVector(w,-.012),_=j(b,_,A,ee,.009,.006,w),A.set(n*sl,h+.03,r*sl),ee.set(n*u,f-.014,r*u),_=j(b,_,A,ee,.006,.006,w)}x.attributes.position.needsUpdate=!0,x.computeVertexNormals(),x.computeBoundingSphere();let te=0,N=e=>{C[te++]=e.x,C[te++]=e.y,C[te++]=e.z},ne=.12,re=.34,ie=[],ae=[];for(let e=0;e<el;e++){let t=e/el*Zc,n=Math.cos(t),r=Math.sin(t),i=n*sl,a=r*sl,o=h+.03,s=n*u,c=r*u,l=f-.014;ie.push(new I($c(i,s,ne),$c(o,l,ne),$c(a,c,ne))),ae.push(new I($c(i,s,re),$c(o,l,re),$c(a,c,re)))}for(let e=0;e<el;e++){let t=(e+1)%el;N(ie[e]),N(ie[t]),N(ae[t]),N(ie[e]),N(ae[t]),N(ae[e])}T.attributes.position.needsUpdate=!0,T.computeVertexNormals(),T.computeBoundingSphere(),E.visible=r>.15,S.visible=!0,y.visible=!0}return N(1),{group:l,setOpen:N,dispose(){l.parent?.remove(l),v.dispose(),x.dispose(),T.dispose()}}}var{clamp:_l,lerp:vl,degToRad:yl}=ot,bl=Math.PI*2,Y=(e=0,t=0,n=0)=>new I(e,t,n),xl=Object.freeze(new I(1,0,0)),Sl=Object.freeze(new I(0,1,0)),Cl=Object.freeze(new I(0,0,1)),wl=(e,t,n)=>{let r=_l((n-e)/(t-e),0,1);return r*r*(3-2*r)},Tl=(e,t,n,r)=>vl(e,t,1-Math.exp(-n*r)),El=e=>`#`+new B(e).getHexString();function Dl(e){let t=e.attributes.position,n=e.attributes.normal,r=new Map;for(let e=0;e<t.count;e++){let n=`${Math.round(t.getX(e)*1e4)},${Math.round(t.getY(e)*1e4)},${Math.round(t.getZ(e)*1e4)}`,i=r.get(n);i||r.set(n,i=[]),i.push(e)}let i=new I;for(let e of r.values())if(!(e.length<2)){i.set(0,0,0);for(let t of e)i.x+=n.getX(t),i.y+=n.getY(t),i.z+=n.getZ(t);i.normalize();for(let t of e)n.setXYZ(t,i.x,i.y,i.z)}return e}function Ol(e,t,n,i={}){let a=i.n1??2,o=i.n2??2,s=new r(1,i.ws??32,i.hs??16),c=s.attributes.position,l=new I;for(let r=0;r<c.count;r++){l.fromBufferAttribute(c,r);let s=((Math.abs(l.x)**+a+Math.abs(l.z)**+a)**(o/a)+Math.abs(l.y)**+o)**(-1/o);l.multiplyScalar(s),l.set(l.x*e,l.y*t,l.z*n),i.deform&&i.deform(l),c.setXYZ(r,l.x,l.y,l.z)}return s.computeVertexNormals(),Dl(s),s}function kl(e,t=24,n=0,r=bl){let i=e.map(([e,t])=>new F(Math.max(e,1e-4),t)),a=new rt(i,t,n,r),o=[0];for(let e=1;e<i.length;e++)o.push(o[e-1]+i[e].distanceTo(i[e-1]));let s=o[o.length-1]||1,c=a.attributes.uv;for(let e=0;e<=t;e++)for(let t=0;t<i.length;t++)c.setY(e*i.length+t,o[t]/s);return a}function Al(e){let t=[0];for(let n=1;n<e.length;n++){let r=e[n][0]-e[n-1][0],i=e[n][1]-e[n-1][1];t.push(t[n-1]+Math.hypot(r,i))}return t.map(e=>e/t[t.length-1])}function jl(e,t=Y(0,1,0)){let n=e.clone().normalize(),r=new I().crossVectors(t,n);r.lengthSq()<1e-6&&r.set(1,0,0),r.normalize();let i=new I().crossVectors(n,r).normalize();return new p().setFromRotationMatrix(new xe().makeBasis(r,i,n))}function Ml(e){return new p().setFromUnitVectors(Y(0,1,0),e.clone().normalize())}function Nl(e=0,t=0,r=0,i=`XYZ`){return new p().setFromEuler(new n(e,t,r,i))}function Pl(e,t){let n=e.clone().normalize(),r=t.clone().addScaledVector(n,-t.dot(n)).normalize(),i=new I().crossVectors(n,r).normalize();return new p().setFromRotationMatrix(new xe().makeBasis(i,n,r))}function Fl(e,t){if(Math.abs(t)<1e-6)return e;let n=e.attributes.position;for(let e=0;e<n.count;e++){let r=n.getX(e),i=n.getY(e),a=n.getZ(e),o=t*i,s=Math.sin(o),c=Math.cos(o);n.setXYZ(e,r,s/t-a*s,(1-c)/t+a*c)}return e.computeVertexNormals(),e.index&&Dl(e),e}function Il(e,t,n,r=13,i=14){let a=[[0,-.005]];for(let i=0;i<=r;i++){let o=i/r,s=n+(t-n)*Math.sin(Math.PI*Math.min(1,o**.7*.92+.04));o>.8&&(s*=Math.sqrt(Math.max(0,1-((o-.8)/.2)**2))),a.push([i===r?0:s,o*e])}return kl(a,i)}function Ll(e){let t=e.index;if(t)for(let e=0;e<t.count;e+=3){let n=t.getX(e+1);t.setX(e+1,t.getX(e+2)),t.setX(e+2,n)}else for(let t of Object.keys(e.attributes)){let n=e.attributes[t];for(let e=0;e<n.count;e+=3)for(let t=0;t<n.itemSize;t++){let r=n.getComponent(e+1,t);n.setComponent(e+1,t,n.getComponent(e+2,t)),n.setComponent(e+2,t,r)}}}function Rl(e){e.attributes.normal||e.computeVertexNormals(),e.attributes.uv||e.setAttribute(`uv`,new st(new Float32Array(e.attributes.position.count*2),2));for(let t of Object.keys(e.attributes))t!==`position`&&t!==`normal`&&t!==`uv`&&e.deleteAttribute(t);if(!e.index){let t=e.attributes.position.count,n=new Uint32Array(t);for(let e=0;e<t;e++)n[e]=e;e.setIndex(new st(n,1))}return e.morphAttributes={},e.clearGroups(),e}var zl=class{constructor(){this.slots=new Map}add(e,t,n,r,i){let a=t.clone(),o=n?n.isVector3?n:Y(n[0],n[1],n[2]):Y(),s=r?r.isQuaternion?r:Nl(r[0],r[1],r[2],r[3]||`XYZ`):new p,c=i==null?Y(1,1,1):typeof i==`number`?Y(i,i,i):i.isVector3?i:Y(i[0],i[1],i[2]),l=new xe().compose(o,s,c);return a.applyMatrix4(l),l.determinant()<0&&Ll(a),this.addRaw(e,a),a}addRaw(e,t){let n=this.slots.get(e);n||this.slots.set(e,n=[]),n.push(Rl(t))}merge(){let e=new Map;for(let[t,n]of this.slots){let r=n.length===1?n[0]:ut(n,!1);r.computeBoundingSphere(),e.set(t,r)}return e}};function Bl(e,t,n,{cast:r=!0,receive:i=!0,noCast:a=[]}={}){for(let[o,s]of e){let e=t[o];if(!e){console.warn(`[kart] missing material for slot`,o);continue}let c=new U(s,e);c.castShadow=r&&!a.includes(o),c.receiveShadow=i,c.name=o,n.add(c)}}var Vl=new Map,Hl=new Map,Ul=new Map;function Wl(e,t){let n=Vl.get(e);return n||(n=t(),n.name=`kart.`+e,Vl.set(e,n)),n}function Gl(e,t){let n=Hl.get(e);return n||Hl.set(e,n=t()),n}function Kl(e,t,n,r,i={}){let a=Ul.get(e);if(a)return a;let o=document.createElement(`canvas`);return o.width=t,o.height=n,r(o.getContext(`2d`),t,n),a=new ft(o),a.colorSpace=i.linear?``:oe,a.anisotropy=8,i.repeat&&(a.wrapS=a.wrapT=Re,a.repeat.set(i.repeat[0],i.repeat[1])),i.wrapS&&(a.wrapS=Re),a.needsUpdate=!0,Ul.set(e,a),a}function ql(e,t=2,n=!0){let r=e.width,i=e.height,a=e.getContext(`2d`).getImageData(0,0,r,i).data,o=document.createElement(`canvas`);o.width=r,o.height=i;let s=o.getContext(`2d`),c=s.createImageData(r,i),l=(e,t)=>(n?(e=(e+r)%r,t=(t+i)%i):(e=_l(e,0,r-1),t=_l(t,0,i-1)),a[(t*r+e)*4]/255);for(let e=0;e<i;e++)for(let n=0;n<r;n++){let i=(l(n+1,e)-l(n-1,e))*t,a=(l(n,e+1)-l(n,e-1))*t,o=-i,s=a,u=1,d=Math.hypot(o,s,u);o/=d,s/=d,u/=d;let f=(e*r+n)*4;c.data[f]=(o*.5+.5)*255,c.data[f+1]=(s*.5+.5)*255,c.data[f+2]=(u*.5+.5)*255,c.data[f+3]=255}return s.putImageData(c,0,0),o}var Jl=`'Hiragino Mincho ProN','Yu Mincho','YuMincho','Noto Serif JP','Noto Serif CJK JP',serif`,Yl=`'Hiragino Maru Gothic ProN','Hiragino Sans','Yu Gothic','Noto Sans JP',sans-serif`;function Xl(e,t,n,r){let i=e.measureText(t),a=i.actualBoundingBoxAscent||0,o=i.actualBoundingBoxDescent||0,s=i.actualBoundingBoxLeft||0,c=i.actualBoundingBoxRight||0;e.textAlign=`left`,e.textBaseline=`alphabetic`,e.fillText(t,n-(c-s)/2,r+(a-o)/2)}var Zl=e=>e.toString(16).padStart(6,`0`);function Ql(e){return Wl(`paint`+Zl(e),()=>new Ae({color:e,roughness:.34,metalness:0,clearcoat:1,clearcoatRoughness:.06}))}function $l(e){return Wl(`rim`+Zl(e),()=>new Ae({color:e,roughness:.24,metalness:.65,clearcoat:1,clearcoatRoughness:.04}))}function eu(e,t=``){return Wl(`fur`+Zl(e)+t,()=>{let t=new B(e),n=t.r*.3+t.g*.59+t.b*.11;return new Ae({color:t,roughness:.75,metalness:0,sheen:n>.6?.12:.65,sheenRoughness:.55,sheenColor:t.clone().lerp(new B(16777215),n>.6?.1:.5)})})}function tu(e,t=.7){return Wl(`cloth`+Zl(e)+t,()=>new Ae({color:e,roughness:t,sheen:.4,sheenRoughness:.6,sheenColor:new B(e).lerp(new B(16777215),.4)}))}function nu(e,t=.3){return Wl(`gloss`+Zl(e)+t,()=>new Ae({color:e,roughness:t,clearcoat:.8,clearcoatRoughness:.15}))}var ru={chrome:()=>Wl(`chrome`,()=>new R({color:15659510,metalness:1,roughness:.14})),darkMetal:()=>Wl(`darkMetal`,()=>new R({color:4738133,metalness:.85,roughness:.36})),black:()=>Wl(`blackPlastic`,()=>new R({color:2763055,roughness:.55})),seat:()=>Wl(`seat`,()=>new Ae({color:3486011,roughness:.5,clearcoat:.35,clearcoatRoughness:.35})),lamp:()=>Wl(`lamp`,()=>new R({color:16774358,emissive:16769696,emissiveIntensity:1.15,roughness:.15})),tailLamp:()=>Wl(`tailLamp`,()=>new R({color:16734794,emissive:16722456,emissiveIntensity:1.6,roughness:.2})),gold:()=>Wl(`gold`,()=>new R({color:15909463,metalness:1,roughness:.22})),eye:()=>Wl(`eye`,()=>new Ae({color:1709081,roughness:.12,clearcoat:1,clearcoatRoughness:.03})),eyeRed:()=>Wl(`eyeRed`,()=>new Ae({color:12720175,roughness:.12,clearcoat:1,clearcoatRoughness:.03})),hi:()=>Wl(`eyeHi`,()=>new R({color:16777215,emissive:16777215,emissiveIntensity:.6,roughness:.3})),nose:()=>Wl(`nose`,()=>new Ae({color:2892324,roughness:.25,clearcoat:1,clearcoatRoughness:.1})),mouth:()=>Wl(`mouth`,()=>new R({color:4860456,roughness:.6})),tongue:()=>Wl(`tongue`,()=>new R({color:15234172,roughness:.5})),white:()=>Wl(`toothWhite`,()=>new R({color:16513266,roughness:.35})),blush:()=>Wl(`blush`,()=>new R({map:iu(),transparent:!0,depthWrite:!1,color:16777215,roughness:.8,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2})),rubber:e=>Wl(`rubber`+e,()=>new R({color:3025969,roughness:.78,normalMap:su(e),normalScale:new F(1.4,1.4)})),star:()=>Wl(`star`,()=>new R({color:16769126,emissive:16761370,emissiveIntensity:1.7,roughness:.4})),dizzy:()=>Wl(`dizzy`,()=>new lt({map:ou(),transparent:!0,alphaTest:.3,depthWrite:!1}))};function iu(){return Kl(`blush`,64,64,(e,t,n)=>{let r=e.createRadialGradient(t/2,n/2,2,t/2,n/2,t/2);r.addColorStop(0,`rgba(255,120,140,0.85)`),r.addColorStop(.55,`rgba(255,125,145,0.55)`),r.addColorStop(1,`rgba(255,130,150,0)`),e.fillStyle=r,e.fillRect(0,0,t,n),e.strokeStyle=`rgba(235,80,105,0.55)`,e.lineWidth=3,e.lineCap=`round`;for(let r=-1;r<=1;r++)e.beginPath(),e.moveTo(t/2+r*11-4,n/2+7),e.lineTo(t/2+r*11+4,n/2-7),e.stroke()})}function au(){let e=`hairStrands`;if(Ul.has(e))return Ul.get(e);let t=document.createElement(`canvas`);t.width=256,t.height=64;let n=t.getContext(`2d`);for(let e=0;e<256;e++){let t=.5+.32*Math.sin(e/256*bl*26)+.12*Math.sin(e/256*bl*61+1.3),r=Math.round(_l(t,0,1)*255);n.fillStyle=`rgb(${r},${r},${r})`,n.fillRect(e,0,1,64)}let r=new ft(ql(t,2.2));return r.colorSpace=``,r.wrapS=r.wrapT=Re,Ul.set(e,r),r}function ou(){return Kl(`dizzy`,64,64,(e,t,n)=>{e.strokeStyle=`#231a20`,e.lineWidth=5,e.lineCap=`round`,e.beginPath();for(let r=0;r<bl*2.6;r+=.1){let i=3+r*3.4,a=t/2+Math.cos(r)*i,o=n/2+Math.sin(r)*i;r===0?e.moveTo(a,o):e.lineTo(a,o)}e.stroke()})}function su(e){let t=`tread-`+e;if(Ul.has(t))return Ul.get(t);let{vA:n,vB:r}=cu[e].band,i=1024,a=document.createElement(`canvas`);a.width=i,a.height=128;let o=a.getContext(`2d`);o.fillStyle=`#808080`,o.fillRect(0,0,i,128);let s=(1-r)*128,c=(1-n)*128,l=(s+c)/2,u=c-s;o.fillStyle=`#c8c8c8`,o.fillRect(0,s,i,u),o.strokeStyle=`#303030`,o.lineCap=`round`,o.lineWidth=7;for(let e=-1;e<=22;e++){let t=e/22*i;o.beginPath(),o.moveTo(t-14,s-2),o.lineTo(t+12,l),o.lineTo(t-14,c+2),o.stroke()}o.fillStyle=`#383838`,o.fillRect(0,l-2.5,i,5),o.fillStyle=`#a0a0a0`;let d=c+(128-c)*.55,f=s*.45;o.fillRect(0,d-1.5,i,3),o.fillRect(0,f-1.5,i,3),o.font=`bold ${Math.round(Math.min(18,(128-c)*.42))}px ${Yl}`,o.fillStyle=`#b4b4b4`;for(let e=0;e<3;e++)o.textAlign=`center`,o.textBaseline=`middle`,o.fillText(`PONPOKO`,(e+.25)/3*i,(c+128)/2+3),o.fillText(`PONPOKO`,(e+.75)/3*i,s/2-3);let p=ql(a,3.2),m=new ft(p);return m.colorSpace=``,m.wrapS=Re,m.anisotropy=8,Ul.set(t,m),m}var cu={rear:{R:.32,W:.27,rimR:.19,x:.53,z:-.58,seg:22},front:{R:.26,W:.21,rimR:.155,x:.52,z:.6,seg:20}};function lu({R:e,W:t,rimR:n}){let r=t/2,i=Math.min(.065,t*.28),a=t*.07,o=[];for(let t=0;t<=2;t++){let s=t/2;o.push([vl(n,e-i,s),-r-a*Math.sin(Math.PI*s)+(1-s)*.012])}for(let t=1;t<=2;t++){let n=-Math.PI/2+t/2*(Math.PI/2);o.push([e-i+i*Math.cos(n),-r+i+i*Math.sin(n)])}o.push([e+.006,0]);for(let t=0;t<2;t++){let n=t/2*(Math.PI/2);o.push([e-i+i*Math.cos(n),r-i+i*Math.sin(n)])}for(let t=0;t<=2;t++){let s=t/2;o.push([vl(e-i,n,s),r+a*Math.sin(Math.PI*(1-s))-s*.012])}return o}for(let e of Object.keys(cu)){let t=lu(cu[e]),n=Al(t);cu[e].profile=t,cu[e].band={vA:n[3],vB:n[t.length-4]}}function uu(e){return Gl(`wheel-`+e,()=>{let t=cu[e],n=new zl,r=kl(t.profile,t.seg);r.rotateZ(-Math.PI/2),n.addRaw(`rubber`,r);let i=new et(t.rimR+.01,14);n.add(`rubber`,i,[-t.W*.25,0,0],[0,-Math.PI/2,0]),n.add(`rubber`,i,[-t.W*.25+.004,0,0],[0,Math.PI/2,0]);let a=t.rimR+.012,o=new f;for(let e=0;e<24;e++){let t=e/24*bl;e===0?o.moveTo(Math.cos(t)*a,Math.sin(t)*a):o.lineTo(Math.cos(t)*a,Math.sin(t)*a)}o.closePath();for(let e=0;e<5;e++){let t=e/5*bl+Math.PI/2,n=a*.58,r=a*.21,i=new Ct;for(let e=0;e<8;e++){let a=-(e/8)*bl,o=Math.cos(t)*n+Math.cos(a)*r,s=Math.sin(t)*n+Math.sin(a)*r;e===0?i.moveTo(o,s):i.lineTo(o,s)}i.closePath(),o.holes.push(i)}let s=new k(o,{depth:.026,bevelEnabled:!1});s.translate(0,0,-.013);let c=t.W/2-.03;n.add(`rim`,s,[c,0,0],[0,Math.PI/2,0]);let l=kl([[0,-.005],[a*.36,-.005],[a*.35,.016],[a*.26,.034],[a*.12,.043],[0,.045]],10);return n.add(`chrome`,l,[c+.012,0,0],[0,0,-Math.PI/2]),n.merge()})}var du={wheelCenter:Y(0,.72,.08),wheelTilt:.72,wheelR:.12,exhaust:[Y(.15,.56,-1.04),Y(-.15,.56,-1.04)],flagX:.3,flagZ:-.84,com:Y(0,.5,-.05)},fu=[[-.97,.3,.22,.44],[-.84,.34,.19,.475],[-.62,.37,.18,.51],[-.38,.38,.18,.54],[-.12,.38,.18,.545],[.1,.37,.18,.565],[.26,.335,.185,.6],[.42,.3,.19,.545],[.6,.285,.2,.475],[.78,.265,.21,.425],[.99,.22,.24,.38]],pu=-.975,mu=.995,hu=2.4,gu=3.6;function _u(e){return t=>{let n=0;for(;n<e.length-2&&t>e[n+1][0];)n++;let r=e[Math.max(0,n-1)],i=e[n],a=e[n+1],o=e[Math.min(e.length-1,n+2)],s=_l((t-i[0])/(a[0]-i[0]),0,1),c=[];for(let e=1;e<i.length;e++){let t=r[e],n=i[e],l=a[e],u=o[e];c.push(.5*(2*n+(-t+l)*s+(2*t-5*n+4*l-u)*s*s+(-t+3*n-3*l+u)*s*s*s))}return c}}var vu=_u(fu);function yu(e){let[t,n,r]=vu(_l(e,pu,mu)),i=1,a=.83,o=-.83;e>a&&(i=Math.sqrt(Math.max(0,1-((e-a)/.16500000000000004)**2))),e<o&&(i=Math.sqrt(Math.max(0,1-((e-o)/-.14500000000000002)**2)));let s=(r+n)/2,c=(r-n)/2;return{w:t*i,yc:s,hTop:c*i,hBot:c*i}}function bu(e,t){let n=yu(t),r=Math.min(1,Math.abs(e)/Math.max(n.w,1e-4));return n.yc+n.hTop*Math.max(0,1-r**+hu)**(1/hu)}function xu(e,t,n,{stations:r=34,radial:i=28,nTop:a=2.4,nBot:o=3.6}={}){let s=[],c=[],l=[];for(let l=0;l<r;l++){let u=l/(r-1),d=t+(n-t)*(.35*u+.65*(.5-.5*Math.cos(Math.PI*u))),f=e(d);for(let e=0;e<=i;e++){let t=e/i*bl,n=Math.cos(t),r=Math.sin(t),l=r>=0?a:o,p=f.w*Math.sign(n)*Math.abs(n)**(2/l),m=f.yc+(r>=0?f.hTop:f.hBot)*Math.sign(r)*Math.abs(r)**(2/l);s.push(p,m,d),c.push(e/i,u)}}let u=i+1;for(let e=0;e<r-1;e++)for(let t=0;t<i;t++){let n=e*u+t,r=n+u,i=r+1,a=n+1;l.push(n,a,r,a,i,r)}let d=new we;return d.setAttribute(`position`,new M(s,3)),d.setAttribute(`uv`,new M(c,2)),d.setIndex(l),d.computeVertexNormals(),Dl(d),d}var Su=new Pe;function Cu(e,t,n){e.updateMatrixWorld(!0),Su.set(t,n.clone().normalize()),Su.far=10;let r=Su.intersectObject(e,!1)[0];if(!r)return null;let i=e.geometry,a=i.attributes.position,o=i.attributes.normal,s=r.face,c=e.worldToLocal(r.point.clone()),l=new I;T.getBarycoord(c,Y().fromBufferAttribute(a,s.a),Y().fromBufferAttribute(a,s.b),Y().fromBufferAttribute(a,s.c),l);let u=Y().addScaledVector(Y().fromBufferAttribute(o,s.a),l.x).addScaledVector(Y().fromBufferAttribute(o,s.b),l.y).addScaledVector(Y().fromBufferAttribute(o,s.c),l.z).applyNormalMatrix(new H().getNormalMatrix(e.matrixWorld)).normalize();return{p:r.point.clone(),n:u}}function wu(e,t){let r=e.clone().normalize(),i=t.clone().addScaledVector(r,-t.dot(r)).normalize(),a=new I().crossVectors(r,i).normalize();return new n().setFromRotationMatrix(new xe().makeBasis(i,a,r))}function Tu(){return Gl(`chassis`,()=>{let e=new zl,t=xu(yu,pu,mu,{stations:30,radial:26,nTop:hu,nBot:gu});{let n=t.index.array,r=t.attributes.uv,i=[],a=[];for(let e=0;e<n.length;e+=3){let t=0;for(let i=0;i<3;i++)t+=Math.sin(r.getX(n[e+i])*bl);(t/3<-.3?a:i).push(n[e],n[e+1],n[e+2])}let o=t.clone();o.setIndex(i);let s=t.clone();s.setIndex(a),e.addRaw(`paint`,o),e.addRaw(`accent`,s)}let n=new U(t);n.updateMatrixWorld(!0),e.add(`black`,new Qe(.62,.05,1.45),[0,.18,-.02]);let i=kl([[0,-.27],[.05,-.255],[.08,-.2],[.098,-.1],[.102,.02],[.097,.14],[.088,.21],[.078,.245],[.066,.255],[.058,.24]],14);i.rotateX(Math.PI/2);let a=e=>Y(e*.43,.3,.035);for(let t of[1,-1]){let n=a(t);e.add(`accent`,i,n),e.add(`chrome`,new b(.066,.011,4,14),n.clone().add(Y(0,0,.25))),e.add(`black`,new et(.06,12),n.clone().add(Y(0,0,.235))),e.add(`darkMetal`,new bt(.018,.024,.03,8,1,!0),n.clone().add(Y(0,0,.24)),[Math.PI/2,0,0])}let o=[];for(let e=0;e<28;e++){let t=e/28*bl,n=Math.cos(t),r=Math.sin(t),i=.29*Math.sign(n)*Math.abs(n)**.6,a=-.2+.31*Math.sign(r)*Math.abs(r)**.6;o.push(Y(i,bu(i,a)+.004,a))}e.add(`seat`,new ie(new Ne(o,!0,`centripetal`),32,.032,5,!0)),e.add(`seat`,new Jc(.36,.07,.3,1,.03),[0,.54,-.27]),e.add(`seat`,new Jc(.38,.15,.07,1,.03),[0,.6,-.465],[-.2,0,0]),e.add(`accent`,new Jc(.42,.18,.045,1,.02),[0,.595,-.505],[-.2,0,0]);let s=[Y(.34,.225,.8),Y(.27,.215,.93),Y(.1,.205,1),Y(-.1,.205,1),Y(-.27,.215,.93),Y(-.34,.225,.8)];e.add(`trim`,new ie(new Ne(s),18,.04,7,!1));for(let t of[1,-1])e.add(`trim`,new r(.04,8,5),[t*.34,.225,.8]);for(let t of[1,-1])e.add(`darkMetal`,new bt(.016,.016,.14,6),[t*.14,.215,.92],[Math.PI/2,0,0]);let c=[Y(.3,.25,-.86),Y(.22,.235,-.97),Y(-.22,.235,-.97),Y(-.3,.25,-.86)];e.add(`black`,new ie(new Ne(c),14,.032,6,!1));for(let t of[1,-1])e.add(`black`,new r(.032,8,5),[t*.3,.25,-.86]);for(let t of[1,-1]){let i=Cu(n,Y(t*.13,.35,2),Y(0,0,-1));i&&(e.add(`lamp`,new r(.048,8,5),i.p.clone().addScaledVector(i.n,-.01),jl(i.n),[1,1,.6]),e.add(`chrome`,new b(.05,.01,3,12),i.p.clone().addScaledVector(i.n,.004),jl(i.n)));let a=Cu(n,Y(t*.19,.34,-2),Y(0,0,1));a&&(e.add(`tailLamp`,new r(.03,8,5),a.p.clone().addScaledVector(a.n,-.006),jl(a.n),[1.3,.8,.5]),e.add(`chrome`,new b(.03,.007,3,12),a.p.clone().addScaledVector(a.n,.002),jl(a.n),[1.3,.8,1]))}e.add(`darkMetal`,new Jc(.44,.2,.28,1,.045),[0,.53,-.76]);for(let t=0;t<3;t++)for(let n of[1,-1])e.add(`chrome`,new Qe(.03,.016,.22),[n*.228,.47+t*.045,-.76]);e.add(`accent`,Ol(.19,.06,.13,{n1:3,n2:2.2,ws:14,hs:6}),[0,.63,-.76]),e.add(`chrome`,kl([[0,0],[.07,0],[.078,.012],[.078,.04],[.07,.052],[0,.052]],14),[.07,.66,-.74]),e.add(`darkMetal`,new bt(.03,.03,.04,10),[.07,.65,-.74]);let l=kl([[.032,0],[.032,.14],[.036,.17],[.048,.2],[.05,.215],[.038,.214],[.028,.19]],12),u=new et(.03,10);for(let t of du.exhaust){let n=Y(0,.28,-1).normalize(),r=t.clone().addScaledVector(n,-.215);e.add(`chrome`,l,r,Ml(n)),e.add(`black`,u,t.clone().addScaledVector(n,-.02),jl(n))}for(let t of[1,-1])e.add(`darkMetal`,new bt(.022,.022,.2,8),[t*.36,.26,.6],[0,0,Math.PI/2]),e.add(`darkMetal`,new bt(.016,.016,.2,6),[t*.34,.31,.55],[.5,0,Math.PI/2-.25]),e.add(`darkMetal`,new bt(.028,.028,.12,8),[t*.42,.32,-.58],[0,0,Math.PI/2]);{let t=Y(0,.56,.3),n=du.wheelCenter.clone().add(Y(0,-.01,.02)).clone().sub(t);e.add(`darkMetal`,new bt(.019,.024,n.length(),8),t.clone().addScaledVector(n,.5),Ml(n))}for(let t of[1,-1]){let n=bu(t*du.flagX,du.flagZ),i=1.06-n;e.add(`chrome`,new bt(.011,.013,i,8),[t*du.flagX,n+i/2,du.flagZ]),e.add(`gold`,new r(.022,6,4),[t*du.flagX,1.075,du.flagZ]),e.add(`darkMetal`,new bt(.02,.024,.05,8),[t*du.flagX,n+.015,du.flagZ])}let d=e.merge();for(let e of[`paint`,`accent`]){let t=d.get(e),n=t.attributes.position,r=t.attributes.uv;for(let e=0;e<n.count;e++)r.setXY(e,n.getZ(e)*.5+.5,n.getY(e)*1.2+n.getX(e)*.15)}let f=new zl,p=Cu(n,Y(0,2,.63),Y(0,-1,0));p&&f.addRaw(`emblem`,new Yc(n,p.p,wu(p.n,Y(1,0,0)),Y(.2,.2,.3)));let m=Cu(n,Y(0,.325,2),Y(0,0,-1));m&&f.addRaw(`emblem`,new Yc(n,m.p,wu(m.n,Y(1,0,0)),Y(.12,.12,.12)));let h=new U(i);for(let e of[1,-1]){h.position.copy(a(e)),h.updateMatrixWorld(!0);let t=Cu(h,Y(e*2,.31,.05),Y(-e,0,0));t&&f.addRaw(`emblem`,new Yc(h,t.p,wu(t.n,Y(0,0,-e)),Y(.15,.15,.2)))}let g=new U(new Jc(.42,.18,.045,1,.02));g.position.set(0,.595,-.505),g.rotation.set(-.2,0,0),g.updateMatrixWorld(!0);let _=Cu(g,Y(0,.6,-2),Y(0,0,1));return _&&f.addRaw(`emblem`,new Yc(g,_.p,wu(_.n,Y(-1,0,0)),Y(.15,.15,.1))),d.set(`emblem`,f.merge().get(`emblem`)),d})}function Eu(){return Gl(`steer`,()=>{let e=new zl,t=du.wheelR;e.add(`black`,new b(t,.021,5,20));for(let n of[Math.PI*.2,Math.PI*.8])e.add(`accent`,new b(t,.025,6,5,Math.PI*.26),[0,0,0],[0,0,n-Math.PI*.13]);for(let n of[Math.PI/2+Math.PI,Math.PI/2+2.2,Math.PI/2-2.2]){let r=Y(Math.cos(n),Math.sin(n),0);e.add(`chrome`,new bt(.011,.013,t,6),r.clone().multiplyScalar(t/2),Ml(r))}return e.add(`accent`,new bt(.04,.044,.032,12),[0,0,.005],[Math.PI/2,0,0]),e.add(`gold`,new bt(.02,.02,.012,12),[0,0,.024],[Math.PI/2,0,0]),e.merge()})}function Du(){return Gl(`star`,()=>{let e=new f;for(let t=0;t<10;t++){let n=t/10*bl+Math.PI/2,r=t%2==0?.055:.024;t===0?e.moveTo(Math.cos(n)*r,Math.sin(n)*r):e.lineTo(Math.cos(n)*r,Math.sin(n)*r)}e.closePath();let t=new k(e,{depth:.012,bevelEnabled:!0,bevelThickness:.008,bevelSize:.008,bevelSegments:1});return t.center(),t})}function Ou(e){let t=new B(e.colors.body),n={};return t.getHSL(n),n.l<.25||t.setHSL(n.h,Math.max(n.s,.55),Math.min(n.l,.34)),t}function ku(e){return Kl(`emblem-`+e.id,256,256,(t,n,r)=>{let i=n/2,a=r/2;t.clearRect(0,0,n,r);let o=(e,n)=>{t.beginPath(),t.arc(i,a,e,0,bl),t.fillStyle=n,t.fill()},s=new B(15185486);o(126,El(6965788)),o(122,`#`+s.getHexString()),o(108,`#fbf7ee`),t.lineWidth=6,t.strokeStyle=`#`+Ou(e).getHexString(),t.beginPath(),t.arc(i,a,97,0,bl),t.stroke(),t.fillStyle=`#`+Ou(e).getHexString(),t.font=`bold 132px ${Jl}`,Xl(t,e.kanji,i,a+2)})}function Au(e){return Kl(`flag-`+e.id,256,256,(t,n,r)=>{let i=new B(e.colors.body),a=i.r*.3+i.g*.59+i.b*.11>.62?`#2a2630`:`#fbf6ea`;for(let n of[0,1]){let i=n*128;t.fillStyle=El(e.colors.body),t.fillRect(i,0,128,r),t.fillStyle=El(e.colors.accent);let o=n===0?i:i+128-16;t.fillRect(o,0,16,r),t.fillRect(i,0,128,14),t.fillStyle=El(e.colors.trim),t.fillRect(i,r-10,128,10);let s=i+64+(n===0?8:-8);t.fillStyle=a,t.font=`bold 88px ${Jl}`,Xl(t,e.kanji,s,r*.38),t.font=`bold 28px ${Yl}`;let c=e.name;for(let e=0;e<c.length;e++)Xl(t,c[e],s,r*.64+e*29)}})}function ju(e,t,n,r=1){return Kl(e,512,256,(e,i,a)=>{e.fillStyle=El(t),e.fillRect(0,0,i,a),e.fillStyle=El(n);let o=7,s=()=>(o=o*16807%2147483647)/2147483647;for(let t=0;t<12;t++){let n=(t+.5)/12*i+(s()-.5)*10,o=(4+s()*4)*r,c=s()*6,l=-5+s()*a*.15,u=a+5-s()*a*.2;e.beginPath();for(let t=0;t<=10;t++){let r=t/10,i=vl(l,u,r),a=n+Math.sin(r*5+c)*9,s=o*(.35+Math.sin(Math.PI*r)*.9);t===0?e.moveTo(a-s,i):e.lineTo(a-s,i)}for(let t=10;t>=0;t--){let r=t/10,i=vl(l,u,r),a=n+Math.sin(r*5+c)*9,s=o*(.35+Math.sin(Math.PI*r)*.9);e.lineTo(a+s,i)}if(e.closePath(),e.fill(),t%2==0){let t=a*(.3+s()*.4),i=n+Math.sin((t-l)/(u-l)*5+c)*9;e.beginPath(),e.moveTo(i,t-5*r),e.lineTo(i+22+s()*8,t-14),e.lineTo(i,t+5*r),e.fill()}}},{repeat:[1,1]})}function Mu(){return Kl(`cucumber`,256,256,(e,t,n)=>{e.fillStyle=El(6009930),e.fillRect(0,0,t,n);for(let r=0;r<9;r++){let i=r/9*n;e.fillStyle=`rgba(210,240,150,0.35)`,e.fillRect(0,i,t,7)}let r=3,i=()=>(r=r*16807%2147483647)/2147483647;for(let r=0;r<110;r++)e.fillStyle=`rgba(240,255,200,0.55)`,e.beginPath(),e.arc(i()*t,i()*n,2+i()*1.5,0,bl),e.fill()},{repeat:[3,2]})}function Nu(e){let t=e.colors,n={paint:Ql(t.body),accent:Ql(t.accent),trim:Ql(t.trim),rim:$l(t.accent),chrome:ru.chrome(),darkMetal:ru.darkMetal(),black:ru.black(),seat:ru.seat(),lamp:ru.lamp(),tailLamp:ru.tailLamp(),gold:ru.gold(),rubber:null,emblem:Wl(`emblem-`+e.id,()=>new Ae({map:ku(e),alphaTest:.5,roughness:.35,clearcoat:1,clearcoatRoughness:.08,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4})),flag:Wl(`flag-`+e.id,()=>new R({map:Au(e),roughness:.8}))};return e.id===`oni`&&(n.paint=Wl(`paint-oni`,()=>new Ae({map:ju(`tigerKart`,16762410,2827568),roughness:.34,clearcoat:1,clearcoatRoughness:.06})),n.paint.map.repeat.set(1.35,1)),e.id===`kappa`&&(n.paint=Wl(`paint-kappa`,()=>new Ae({map:Mu(),roughness:.38,clearcoat:1,clearcoatRoughness:.08}))),n}var Pu=Y(0,.5,-.27),Fu=Y(0,.83,-.24),Iu=Y(0,1.095,-.215),Lu=Y(0,.655,-.275),Ru=[Y(.155,.765,-.235),Y(-.155,.765,-.235)],zu={a:.29,b:.255,c:.265},Bu=[`blush`,`hi`,`mouth`,`eye`,`nose`,`tongue`,`white`,`whisker`,`pinkNose`,`kuma`,`leafVein`,`bandanaDot`,`gold`,`water`];function Vu(e={}){let t=e.a??zu.a,n=e.b??zu.b,i=e.c??zu.c,a=e.cheek??.07,o=e.flatTop??0,s=e=>{let r=wl(.25,-.6,e.y),s=e.y>0?1-o*e.y*e.y:.96;return Y(t*e.x*(1+a*r),n*e.y*s,i*e.z*(1+a*.35*r))},c=(e,t)=>{let n=yl(e),r=yl(t);return Y(Math.sin(n)*Math.cos(r),Math.sin(r),Math.cos(n)*Math.cos(r))};return{at:(e,t)=>{let n=s(c(e,t)),r=.5,i=s(c(e+r,t)).sub(s(c(e-r,t))),a=s(c(e,t+r)).sub(s(c(e,t-r))),o=new I().crossVectors(i,a).normalize();return o.dot(n)<0&&o.negate(),Math.abs(t)>89&&(o=Y(0,Math.sign(t),0)),{p:n,n:o}},geometry:(e=34,t=26)=>{let n=new r(1,e,t),i=n.attributes.position,a=Y();for(let e=0;e<i.count;e++){a.fromBufferAttribute(i,e).normalize();let t=s(a);i.setXYZ(e,t.x,t.y,t.z)}return n.computeVertexNormals(),Dl(n),n},f:s,dir:c}}var Hu={tanuki:{fur:10126704,fur2:15524043,dark:5127475,inner:15324088,arm:6047803,paw:4864303,cheek:.1},kitsune:{fur:14867926,fur2:15262684,orange:15895086,dark:4009e3,inner:15092268,arm:15895086,paw:4009e3,cheek:.06},neko:{fur:14933459,orange:15899202,black:3879992,inner:16233666,arm:14933459,paw:14933459,cheek:.09},shiba:{fur:14453317,fur2:15787216,inner:16178368,arm:14453317,paw:16313560,cheek:.09},usagi:{fur:15000030,inner:16100544,arm:15000030,paw:15000030,cheek:.06},kappa:{fur:7914334,belly:15919010,beak:16170808,shell:7043644,shellRim:14272378,hair:3034949,dish:15660786,arm:7914334,paw:7914334,cheek:.05},tengu:{fur:14433070,brow:15920870,hair:15262424,robe:3095408,pom:16051938,hat:2894130,arm:3095408,paw:14433070,cheek:.05},oni:{fur:6000608,horn:16308330,hair:3356522,arm:6000608,paw:6000608,cheek:.07}};function Uu(e){let t=Hu[e.id]||Hu.tanuki,n=Vu({cheek:t.cheek,flatTop:e.id===`kappa`?.12:0}),r=Iu.clone().sub(Fu),i={fur:eu(t.fur),arm:eu(t.arm),paw:eu(t.paw),eye:e.id===`usagi`?ru.eyeRed():ru.eye(),hi:ru.hi(),blush:ru.blush(),nose:ru.nose(),mouth:ru.mouth(),tongue:ru.tongue(),white:ru.white(),gold:ru.gold()};t.fur2&&(i.fur2=eu(t.fur2)),t.dark&&(i.dark=eu(t.dark)),t.inner&&(i.inner=eu(t.inner,`in`)),t.orange&&(i.orange=eu(t.orange)),t.black&&(i.black=eu(t.black));let a=Gl(`driver-`+e.id,()=>Wu(e,t,n,r)),o=a.mats(i);Object.assign(i,o);let s=new W;s.name=`driver`,s.position.copy(Pu);let c=new W;c.name=`torso`,s.add(c),Bl(a.torso,i,c,{noCast:Bu});let l=new W;l.name=`head`,l.position.copy(Fu).sub(Pu),s.add(l),Bl(a.head,i,l,{noCast:Bu});let u=new W;u.position.copy(a.eyeCenter),l.add(u),Bl(a.eyes,i,u,{cast:!1});let d=new W;d.visible=!1,l.add(d);for(let e of a.eyeFrames){let t=new U(Gl(`dizzyPlane`,()=>new se(.1,.1)),ru.dizzy());t.position.copy(e.p).addScaledVector(e.n,.012),t.quaternion.copy(jl(e.n)),d.add(t)}let f=new W;f.visible=!1,f.position.copy(r).add(Y(0,zu.b+.14,0)),l.add(f);for(let e=0;e<3;e++){let t=new U(Du(),ru.star()),n=e/3*bl;t.position.set(Math.cos(n)*.26,0,Math.sin(n)*.26),f.add(t)}let p=[];for(let e of a.ears){let t=new W;t.position.copy(e.pos),t.quaternion.copy(e.quat);let n=new W;t.add(n),Bl(e.slots,i,n),(e.parent===`torso`?c:l).add(t),p.push({pivot:n,side:e.side,amp:e.amp??1})}let m=null;if(a.tail){let e=new W;e.position.copy(a.tail.pos),e.quaternion.copy(a.tail.quat);let t=new W;e.add(t),Bl(a.tail.slots,i,t),c.add(e),m=t}let h=Gl(`arm`,()=>{let e=new De(.052,.26,3,10);return e.translate(0,.13,0),e}),g=Gl(`hand`,()=>Ol(.058,.052,.062,{ws:10,hs:7})),_=[],v=[];for(let e=0;e<2;e++){let e=new U(h,i.arm);e.castShadow=!0,s.add(e),_.push(e);let t=new U(g,i.paw);t.castShadow=!0,s.add(t),v.push(t)}if(a.cuffs)for(let e of _){let t=new U(Gl(`cuff`,()=>new b(.056,.014,8,18).rotateX(Math.PI/2)),i.gold);t.position.y=.3,e.add(t)}let y={blinkT:2+e.id.length%3,blink:0,lean:0,headTilt:0,headYaw:0,back:0,up:[0,0],glide:0,hand:[Y(),Y()],handInit:!1},x=new xe,S=Y(),C=Y(),w=Y(),T=Y(),E=Ru.map(e=>e.clone().sub(Pu));function D(e,t){let n=t.time||0,r=_l(t.steer*.1+t.drift*.16,-.3,.3);y.lean=Tl(y.lean,r,8,e),y.back=Tl(y.back,+!!t.boost,6,e),s.rotation.set(-.1*y.back+Math.sin(n*2.1)*.01,0,y.lean),s.position.set(Pu.x,Pu.y,Pu.z-.03*y.back),y.headTilt=Tl(y.headTilt,t.steer*.12+t.drift*.1,7,e),y.headYaw=Tl(y.headYaw,-t.steer*.22-t.drift*.12,6,e);let i=t.spin?Math.sin(n*9)*.25:0;l.rotation.set(Math.sin(n*1.7)*.02+.06*y.back,y.headYaw+i*.5,y.headTilt+i*.4);let a=1+Math.sin(n*2.6)*.012;c.scale.set(a,1+(a-1)*.6,a),y.blinkT-=e,y.blinkT<=0&&(y.blink=.14,y.blinkT=2.5+(Math.sin(n*12.9898)*43758.5453%1+1)%1*3),y.blink>0&&(y.blink-=e);let o=y.blink>0?Math.max(.12,Math.abs(y.blink-.07)/.07):1;if(u.scale.set(1,t.spin?1:o,1),u.visible=!t.spin,d.visible=!!t.spin,f.visible=!!t.spin,t.spin){f.rotation.y=n*5;for(let e of d.children)e.rotation.z=-n*8;for(let e of f.children)e.rotation.y=-n*5}for(let e of p)e.pivot.rotation.set(Math.sin(n*2.2+e.side)*.05*e.amp-y.back*.25*e.amp,0,Math.sin(n*1.6+e.side*2)*.06*e.amp+y.lean*.4*e.amp);m&&m.rotation.set(Math.sin(n*2.4)*.08,Math.sin(n*1.9)*.28+y.lean*.6,0),s.updateMatrix(),x.copy(s.matrix).invert();let h=Math.max(t.trick||0,0),g=_l(t.glide||0,0,1);y.up[0]=Tl(y.up[0],h,10,e),y.up[1]=Tl(y.up[1],Math.max(h,g),10,e);let b=y.handInit?1-Math.exp(-18*e):1;for(let e=0;e<2;e++){let r=e===0?1:-1,i=E[e];if(t.wheelMatrix){let e=r*1.05;C.set(Math.sin(e)*du.wheelR*.95,Math.cos(e)*du.wheelR*.95,.02).applyMatrix4(t.wheelMatrix).applyMatrix4(x)}else t.portrait&&e===0?C.copy(i).add(S.set(.12,.2,.15)):C.copy(i).add(S.set(-r*.06,-.03,.2));w.copy(i).add(S.set(r*.17,.28,.06+Math.sin(n*14+e)*.02)),C.lerp(w,y.up[e]),e===1&&t.gripPoint&&g>0&&(T.copy(t.gripPoint).applyMatrix4(x),C.lerp(T,g*(1-h))),y.hand[e].lerp(C,b);let a=S.copy(y.hand[e]).sub(i),o=Math.max(a.length(),.05);_[e].position.copy(i),_[e].quaternion.setFromUnitVectors(Sl,a.divideScalar(o)),_[e].scale.set(1,_l((o-.02)/.26,.4,2.2),1),v[e].position.copy(y.hand[e]),v[e].quaternion.copy(_[e].quaternion)}y.handInit=!0}return{group:s,headPivot:l,torso:c,eyes:u,dizzy:d,stars:f,arms:_,hands:v,ears:p,tail:m,pose:D}}function Wu(e,t,n,i){let a=new zl,o=new zl,s=new zl,c=[],l=null,d={},m=e=>e.clone().sub(Pu),h=e=>e.clone().add(i),g=Ol(.19,.2,.16,{ws:20,hs:14,deform:e=>{e.y<0&&(e.x*=1.08,e.z*=1.08)}}),v={tengu:`robe`,oni:`tiger`,kitsune:`fur`}[e.id]||`fur`;a.add(v,g,m(Lu)),a.add(`fur`,new bt(.1,.12,.1,12,1,!0),m(Y(0,.82,-.25)));for(let t of Ru)a.add(e.id===`tengu`?`robe`:`arm`,new r(.066,10,7),m(t));o.add(`fur`,n.geometry(30,22),i);let y=(e,t,r=0)=>{let{p:i,n:a}=n.at(e,t);return{p:h(i).addScaledVector(a,-r),n:a,q:jl(a)}},x=[],S={yaw:25,pitch:-8},C={w:.047,h:.063,d:.024};e.id===`kitsune`&&Object.assign(S,{yaw:25,pitch:-6}),e.id===`tengu`&&Object.assign(S,{yaw:24,pitch:-2}),e.id===`kappa`&&Object.assign(S,{yaw:26,pitch:-4}),e.id===`oni`&&Object.assign(S,{yaw:25,pitch:-6});let w=new r(1,12,9),T=new et(1,10),E=[];for(let e of[1,-1]){let t=y(e*S.yaw,S.pitch,C.d*.45);E.push(t),x.push({p:t.p.clone().addScaledVector(t.n,C.d*.45),n:t.n})}let D=E[0].p.clone().add(E[1].p).multiplyScalar(.5);for(let e of E){let t=e.p.clone().sub(D);s.add(`eye`,w,t,e.q,[C.w,C.h,C.d]);let n=Y(1,0,0).applyQuaternion(e.q),r=Y(0,1,0).applyQuaternion(e.q),i=t.clone().addScaledVector(e.n,C.d*.93);s.add(`hi`,T,i.clone().addScaledVector(n,C.w*.34).addScaledVector(r,C.h*.36).addScaledVector(e.n,-.003),e.q,.018),s.add(`hi`,T,i.clone().addScaledVector(n,-C.w*.3).addScaledVector(r,-C.h*.38).addScaledVector(e.n,-.004),e.q,.008)}let O=new se(1,1);for(let e of[1,-1]){let t=y(e*42,-22,-.004);o.add(`blush`,O,t.p,t.q,[.1,.065,1])}let A=(e,t,n,r=.02,i=`mouth`)=>{let a=new b(r,r*.26,4,9,Math.PI),o=Y(1,0,0).applyQuaternion(n);for(let s of[1,-1]){let c=n.clone().multiply(Nl(0,0,Math.PI));e.add(i,a,t.clone().addScaledVector(o,s*r),c)}},ee=(e,t,n,r=.035,i=`mouth`)=>{let a=new b(r,.0065,4,12,Math.PI*.8);e.add(i,a,t,n.clone().multiply(Nl(0,0,Math.PI+Math.PI*.1)))},te=(e,t,n=.045,r=.035)=>{let i=new f;i.moveTo(-n,0),i.quadraticCurveTo(0,-r*2.1,n,0),i.quadraticCurveTo(0,r*.25,-n,0);let a=new u(i,10);e.add(`mouth`,a,t.p.clone().addScaledVector(t.n,.004),t.q);let o=new f;o.moveTo(-n*.55,-r*.75),o.quadraticCurveTo(0,-r*1.6,n*.55,-r*.75),o.quadraticCurveTo(0,-r*.45,-n*.55,-r*.75),e.add(`tongue`,new u(o,8),t.p.clone().addScaledVector(t.n,.006),t.q)},j=(e,{w:t=.1,h:n=.07,d:i=.08,pitch:a=-24,inset:s=.045,noseW:c=.034,noseH:l=.023,mouth:u=`w`,noseSlot:d=`nose`}={})=>{let f=y(0,a,s),p=f.q;o.add(e,new r(1,14,10),f.p,p,[t,n,i]);let m=Y(0,1,0).applyQuaternion(p),h=f.n.clone(),g=f.p.clone().addScaledVector(h,i*.86).addScaledVector(m,n*.42);o.add(d,new r(1,8,6),g,p,[c,l,l*.9]),o.add(`hi`,new et(1,8),g.clone().addScaledVector(h,l*.86).addScaledVector(m,l*.35).add(Y(.008,0,0)),p,.007);let _=f.p.clone().addScaledVector(h,i*.93).addScaledVector(m,-n*.28);return u===`w`&&A(o,_,p,.019),{f,noseP:g,mouthP:_,q:p}},N=(e,t,n,r,{tilt:i=.25,lean:a=-.1,twist:o=0,amp:s=1,inset:l=.02}={})=>{let u=y(e*t,n,l),d=new zl;r(d);let f=Ml(u.n.clone().lerp(Y(0,1,0),.45).normalize()),p=Nl(a,o*e,-e*i);c.push({pos:u.p,quat:f.multiply(p),slots:d.merge(),side:e,amp:s})},ne=({y0:e,y1:t,cols:r,rows:i,pitchTop:a,pitchLow:o,off:s})=>{let c=[],l=[],u=[];for(let u=0;u<=r;u++){let d=vl(e,t,u/r),f=o(d,u);for(let e=0;e<=i;e++){let t=e/i,o=n.at(d,vl(a,f,t)),p=h(o.p).addScaledVector(o.n,s(t,d));c.push(p.x,p.y,p.z),l.push(u/r,1-t)}}for(let e=0;e<r;e++)for(let t=0;t<i;t++){let n=e*(i+1)+t,r=n+i+1;u.push(n,n+1,r,r,n+1,r+1)}let d=new we;return d.setAttribute(`position`,new M(c,3)),d.setAttribute(`uv`,new M(l,2)),d.setIndex(u),d.computeVertexNormals(),d},re=e.id;if(re===`tanuki`){for(let e of[1,-1]){let t=y(e*28,-12,.03);o.add(`dark`,new r(1,12,8),t.p,t.q.clone().multiply(Nl(0,0,e*.5)),[.085,.06,.04])}j(`fur2`,{w:.11,h:.075,d:.085,pitch:-25});for(let e of[1,-1]){let t=y(e*52,-28,.03);o.add(`fur2`,new r(1,10,7),t.p,t.q,[.08,.06,.05])}for(let e of[1,-1])N(e,44,50,e=>{e.add(`dark`,new r(1,12,9),[0,.055,0],null,[.085,.08,.042]),e.add(`inner`,new r(1,10,7),[0,.05,.02],null,[.055,.05,.025])},{tilt:.35,lean:.15});let e=new f;e.moveTo(0,0),e.bezierCurveTo(.075,.03,.09,.15,0,.25),e.bezierCurveTo(-.09,.15,-.075,.03,0,0);let t=new k(e,{depth:.005,bevelEnabled:!0,bevelThickness:.004,bevelSize:.004,bevelSegments:1,curveSegments:10});t.translate(0,0,-.0025),(e=>{let t=e.attributes.position;for(let e=0;e<t.count;e++){let n=t.getX(e),r=t.getY(e);t.setZ(e,t.getZ(e)+1.6*n*n-.9*r*r)}return e.computeVertexNormals(),e})(t);let n=[];for(let e=0;e<=8;e++){let t=e/8*.23;n.push(Y(0,t,-.9*t*t+.006))}let i=new ie(new Ne(n),8,.004,4,!1),s=[Y(0,.005,0),Y(.004,-.03,.008),Y(.02,-.05,.02)],c=new ie(new Ne(s),6,.006,5,!1);d.leaf=()=>nu(6468412,.4),d.leafVein=()=>nu(4164138,.5);let u=y(-14,66,.012),p=Pl(u.n.clone().multiplyScalar(.6).add(Y(.08,.5,-.35)),Y(-.15,.1,1));o.add(`leaf`,t,u.p,p),o.add(`leafVein`,i,u.p,p),o.add(`leafVein`,c,u.p,p),a.add(`fur2`,new r(1,14,10),m(Y(0,.63,-.14)),null,[.14,.14,.06]),d.tail=()=>Wl(`tanukiTail`,()=>new Ae({map:Kl(`tanukiTailStripes`,64,256,(e,t,n)=>{e.fillStyle=El(10126704),e.fillRect(0,0,t,n),e.fillStyle=El(5127475);for(let r of[.28,.5,.7])e.fillRect(0,(1-r)*n-16,t,26);e.fillRect(0,0,t,.12*n)}),roughness:.75,sheen:.7,sheenRoughness:.55,sheenColor:new B(14207928)}));let h=Fl(Il(.44,.135,.06),2.2);l={pos:m(Y(0,.64,-.39)),quat:Pl(Y(0,.3,-1),Y(0,1,0)),slots:(()=>{let e=new zl;return e.add(`tail`,h),e.merge()})()}}else if(re===`kitsune`){d.kuma=()=>nu(14168604,.5);for(let e of[1,-1]){let t=[];for(let n=0;n<=8;n++){let r=n/8,i=y(e*(14+r*30),6+r*16+Math.sin(r*Math.PI)*4,-.002);t.push(i.p)}let n=new Ne(t),r=new ie(n,16,.011,6,!1),i=r.attributes.position;for(let e=0;e<i.count;e++){let t=Math.floor(e/7)/16,r=n.getPoint(t),a=.35+.9*Math.sin(Math.PI*Math.min(1,t*1.1));i.setXYZ(e,r.x+(i.getX(e)-r.x)*a,r.y+(i.getY(e)-r.y)*a,r.z+(i.getZ(e)-r.z)*a)}r.computeVertexNormals(),o.add(`kuma`,r)}let e=y(0,24,-.001);o.add(`kuma`,new r(1,12,8),e.p,e.q,[.022,.03,.01]),j(`fur`,{w:.09,h:.065,d:.11,pitch:-22,inset:.05,noseW:.03,noseH:.022});for(let e of[1,-1]){let t=y(e*62,-30,.03);o.add(`fur`,new L(.06,.13,12),t.p.clone().add(Y(e*.03,-.01,0)),Ml(Y(e*1,-.35,.1)),[1,1,.6])}for(let e of[1,-1])N(e,36,50,e=>{e.add(`orange`,new L(.085,.24,12),[0,.12,0],null,[1,1,.5]),e.add(`inner`,new L(.055,.17,10),[0,.1,.022],null,[1,1,.35]),e.add(`dark`,new L(.03,.06,10),[0,.215,0],null,[1,1,.55])},{tilt:.28,lean:-.05});d.bib=()=>tu(14168604,.75);let t=new f;t.moveTo(-.15,.03),t.quadraticCurveTo(0,-.02,.15,.03),t.quadraticCurveTo(.14,-.18,0,-.22),t.quadraticCurveTo(-.14,-.18,-.15,.03);let n=new k(t,{depth:.012,bevelEnabled:!0,bevelThickness:.006,bevelSize:.006,bevelSegments:2,curveSegments:12}),i=n.attributes.position;for(let e=0;e<i.count;e++)i.setZ(e,i.getZ(e)-i.getX(e)**2*1.6+i.getY(e)*.25);n.computeVertexNormals(),a.add(`bib`,n,m(Y(0,.8,-.14)),Nl(-.2,0,0)),a.add(`bib`,new b(.12,.018,8,24),m(Y(0,.82,-.24)),Nl(Math.PI/2-.25,0,0)),a.add(`orange`,Ol(.185,.19,.12,{ws:16,hs:10}),m(Y(0,.66,-.33))),d.foxTail=()=>Wl(`foxTail`,()=>new Ae({map:Kl(`foxTailTex`,32,256,(e,t,n)=>{let r=e.createLinearGradient(0,n,0,0);r.addColorStop(0,El(15895086)),r.addColorStop(.6,El(16094778)),r.addColorStop(.7,El(16446958)),r.addColorStop(1,El(16446958)),e.fillStyle=r,e.fillRect(0,0,t,n)}),roughness:.75,sheen:.8,sheenRoughness:.5,sheenColor:new B(16769216)}));let s=Fl(Il(.56,.155,.055),2.6);l={pos:m(Y(0,.62,-.39)),quat:Pl(Y(0,.25,-1),Y(0,1,0)),slots:(()=>{let e=new zl;return e.add(`foxTail`,s),e.merge()})()}}else if(re===`neko`){let e=(e,t,n,i,a,s=0)=>{let c=y(t,n,.024);o.add(e,new r(1,12,8),c.p,c.q.clone().multiply(Nl(0,0,s)),[i,a,.03])};e(`orange`,38,44,.1,.085,.4),e(`orange`,66,8,.07,.085,-.3),e(`black`,-40,46,.095,.08,-.4),e(`black`,-150,34,.09,.075,.2),e(`orange`,160,10,.08,.07,.5),d.pinkNose=()=>nu(15764128,.3),j(`fur`,{w:.095,h:.06,d:.07,pitch:-26,noseW:.024,noseH:.016,noseSlot:`pinkNose`}),d.whisker=()=>Wl(`whisker`,()=>new R({color:5917256,roughness:.6}));for(let e of[1,-1])for(let t=0;t<3;t++){let n=y(e*30,-26-t*4,-.01),r=Y(e,.12-t*.12,.18).normalize();o.add(`whisker`,new bt(.0035,.002,.13,3),n.p.clone().addScaledVector(r,.065),Ml(r))}for(let e of[1,-1])N(e,38,46,t=>{t.add(e>0?`orange`:`black`,new L(.1,.16,12),[0,.07,0],null,[1,1,.5]),t.add(`inner`,new L(.065,.11,10),[0,.06,.02],null,[1,1,.3])},{tilt:.32,lean:-.05});d.collar=()=>nu(14692410,.4),a.add(`collar`,new b(.125,.024,6,20),m(Y(0,.82,-.235)),Nl(Math.PI/2-.22,0,0)),a.add(`gold`,new r(.042,12,8),m(Y(0,.775,-.105))),a.add(`nose`,new b(.042,.005,4,14,Math.PI),m(Y(0,.775,-.105))),a.add(`nose`,new bt(.006,.006,.03,5),m(Y(0,.76,-.066)),Nl(Math.PI/2-.2,0,0)),a.add(`orange`,Ol(.13,.12,.08,{ws:14,hs:9}),m(Y(.09,.66,-.36))),a.add(`black`,Ol(.1,.09,.06,{ws:14,hs:9}),m(Y(-.1,.6,-.38))),d.catTail=()=>Wl(`catTail`,()=>new Ae({map:Kl(`catTailTex`,256,16,(e,t,n)=>{e.fillStyle=El(15899202),e.fillRect(0,0,t,n),e.fillStyle=El(3879992),e.fillRect(t*.5,0,t*.1,n),e.fillRect(t*.78,0,t*.22,n)}),roughness:.75,sheen:.6,sheenRoughness:.5,sheenColor:new B(16769216)}));let t=new Ne([Y(0,0,0),Y(0,.06,-.12),Y(0,.2,-.2),Y(0,.36,-.17),Y(0,.44,-.07),Y(0,.42,0)]),n=new ie(t,20,.034,8,!1),i=new r(.034,8,6);l={pos:m(Y(0,.58,-.41)),quat:new p,slots:(()=>{let e=new zl;return e.add(`catTail`,n),e.add(`black`,i,Y(0,.42,0)),e.merge()})()}}else if(re===`shiba`){j(`fur2`,{w:.11,h:.075,d:.09,pitch:-24,noseW:.034,noseH:.024});for(let e of[1,-1]){let t=y(e*40,-30,.035);o.add(`fur2`,new r(1,12,9),t.p,t.q,[.1,.075,.06])}for(let e of[1,-1]){let t=y(e*22,15,-.002);o.add(`fur2`,new r(1,10,7),t.p,t.q,[.03,.021,.012])}for(let e of[1,-1])N(e,38,46,e=>{e.add(`fur`,new L(.1,.17,12),[0,.075,0],null,[1,1,.5]),e.add(`inner`,new L(.066,.12,10),[0,.06,.02],null,[1,1,.3])},{tilt:.3,lean:.05});a.add(`fur2`,new r(1,14,10),m(Y(0,.64,-.15)),null,[.13,.15,.06]),d.bandana=()=>tu(3108822,.65),d.bandanaDot=()=>tu(16054010,.7),a.add(`bandana`,new b(.128,.028,8,24),m(Y(0,.825,-.235)),Nl(Math.PI/2-.22,0,0));let e=new f;e.moveTo(-.15,0),e.quadraticCurveTo(0,.025,.15,0),e.quadraticCurveTo(.06,-.08,0,-.17),e.quadraticCurveTo(-.06,-.08,-.15,0);let t=new k(e,{depth:.008,bevelEnabled:!0,bevelThickness:.005,bevelSize:.005,bevelSegments:1,curveSegments:8}),n=t.attributes.position;for(let e=0;e<n.count;e++)n.setZ(e,n.getZ(e)-n.getX(e)**2*2.2+n.getY(e)*.3);t.computeVertexNormals(),a.add(`bandana`,t,m(Y(0,.81,-.13)),Nl(-.25,0,0));for(let[e,t]of[[.07,.795],[-.07,.795],[0,.745],[.035,.7],[-.035,.7]])a.add(`bandanaDot`,new r(1,8,5),m(Y(e,t,-.105-Math.abs(e)*.2+(.8-t)*.3)),Nl(-.3,0,0),[.014,.014,.006]);let i=new b(.085,.045,10,20,Math.PI*1.55);l={pos:m(Y(0,.6,-.41)),quat:Nl(0,Math.PI/2,0),slots:(()=>{let e=new zl;return e.add(`fur`,i,[0,.085,0],[0,0,-Math.PI/2]),e.merge()})()}}else if(re===`usagi`){j(`fur`,{w:.08,h:.055,d:.06,pitch:-24,noseW:.02,noseH:.015});let e=y(0,-36,0);o.add(`white`,new Jc(.03,.028,.01,1,.004),e.p.clone().addScaledVector(e.n,.03),e.q);for(let e of[1,-1])N(e,22,60,e=>{e.add(`fur`,new De(.06,.3,4,12),[0,.2,0],null,[1,1,.55]),e.add(`inner`,new De(.037,.24,3,8),[0,.2,.022],null,[1,1,.3])},{tilt:.14,lean:-.12,amp:1.6});let t=new f;t.absarc(0,0,.05,Math.PI*.35,Math.PI*1.65,!1),t.absarc(.022,0,.04,Math.PI*1.55,Math.PI*.45,!0);let n=new k(t,{depth:.01,bevelEnabled:!0,bevelThickness:.004,bevelSize:.004,bevelSegments:1,curveSegments:10}),i=y(-36,40,-.01);o.add(`gold`,n,i.p,i.q.clone().multiply(Nl(0,0,.6))),d.ribbon=()=>nu(9067744,.45),a.add(`ribbon`,new b(.122,.02,6,20),m(Y(0,.82,-.235)),Nl(Math.PI/2-.22,0,0));for(let e of[1,-1])a.add(`ribbon`,new L(.05,.1,12),m(Y(e*.055,.79,-.1)),Nl(0,0,e*Math.PI/2),[1,1,.45]);a.add(`ribbon`,new r(.026,12,8),m(Y(0,.79,-.1))),l={pos:m(Y(0,.55,-.43)),quat:new p,slots:(()=>{let e=new zl;return e.add(`fur`,Ol(.07,.065,.065,{ws:14,hs:10})),e.merge()})()}}else if(re===`kappa`){d.beak=()=>nu(t.beak,.35);let e=y(0,-20,.04);o.add(`beak`,new r(1,16,10),e.p,e.q,[.11,.05,.1]),o.add(`mouth`,new b(.09,.005,6,20,Math.PI*.7),e.p.clone().addScaledVector(e.n,.015).add(Y(0,-.004,0)),e.q.clone().multiply(Nl(Math.PI/2+.3,0,Math.PI*1.15)),[1,.9,1]);for(let t of[1,-1])o.add(`nose`,new r(.008,6,4),e.p.clone().addScaledVector(e.n,.09).add(Y(t*.02,.025,0)));d.dish=()=>Wl(`kappaDish`,()=>new Ae({color:15856878,roughness:.25,clearcoat:1,clearcoatRoughness:.05})),d.water=()=>Wl(`kappaWater`,()=>new Ae({color:7128802,roughness:.04,clearcoat:1,metalness:.15,emissive:1731208,emissiveIntensity:.25})),d.hair=()=>Wl(`kappaHair`,()=>new Ae({color:t.hair,roughness:.45,clearcoat:.6,clearcoatRoughness:.3,side:2}));let i=n.at(0,90).p.y,s=h(Y(0,i-.032,0));o.add(`dish`,kl([[0,0],[.11,0],[.148,.012],[.162,.03],[.16,.042],[.149,.043],[.137,.031],[0,.027]],22),s),o.add(`water`,new et(.139,22),s.clone().add(Y(0,.038,0)),[-Math.PI/2,0,0]);{let e=[],t=[];for(let t=0;t<=36;t++){let r=t/36*360,i=Math.max(0,Math.cos(yl(r))),a=t%2==0?0:1;for(let t=0;t<=5;t++){let o=t/5,s=vl(57,22+i*22-a*9,o),c=n.at(r,s),l=h(c.p).addScaledVector(c.n,.012+.016*Math.sin(Math.PI*o)+.01*o);e.push(l.x,l.y,l.z)}}for(let e=0;e<36;e++)for(let n=0;n<5;n++){let r=e*6+n,i=r+5+1;t.push(r,r+1,i,i,r+1,i+1)}let r=new we;r.setAttribute(`position`,new M(e,3)),r.setIndex(t),r.computeVertexNormals(),o.addRaw(`hair`,r)}d.shell=()=>Wl(`kappaShell`,()=>new Ae({color:16777215,map:Kl(`shellTex`,256,256,(e,t,n)=>{e.fillStyle=El(7043644),e.fillRect(0,0,t,n),e.strokeStyle=El(4147746),e.lineWidth=6;for(let t=-1;t<6;t++)for(let n=-1;n<6;n++){let r=n*36*1.5,i=t*36*1.732+(n%2?31.176:0);e.beginPath();for(let t=0;t<=6;t++){let n=t/6*bl;e.lineTo(r+Math.cos(n)*36,i+Math.sin(n)*36)}e.stroke()}}),roughness:.45,clearcoat:.6})),d.shellRim=()=>nu(t.shellRim,.5),a.add(`shell`,Ol(.21,.23,.11,{ws:20,hs:12}),m(Y(0,.68,-.38))),a.add(`shellRim`,new b(.2,.025,6,26),m(Y(0,.68,-.34)),null,[1,1.12,1]),d.belly=()=>eu(t.belly),a.add(`belly`,new r(1,14,10),m(Y(0,.64,-.15)),null,[.14,.16,.06]);for(let e=0;e<3;e++)a.add(`shellRim`,new b(.1,.006,6,18,Math.PI),m(Y(0,.6+e*.05,-.1)),Nl(0,0,Math.PI),[1.1,.25,1])}else if(re===`tengu`){d.robe=()=>tu(t.robe,.7),d.robe2=()=>nu(14856524,.35),d.hat=()=>nu(t.hat,.3),d.pom=()=>eu(t.pom,`pom`),d.brow=()=>eu(t.brow,`brow`);let e=y(0,-8,.02),n=Y(0,.22,1).normalize();o.add(`fur`,new bt(.017,.046,.2,12,2),e.p.clone().addScaledVector(n,.1),Ml(n)),o.add(`fur`,new r(.019,8,6),e.p.clone().addScaledVector(n,.2));for(let e of[1,-1]){let t=y(e*24,12,0);o.add(`brow`,Ol(.062,.03,.03,{ws:10,hs:6}),t.p,t.q.clone().multiply(Nl(0,0,e*-.35)))}let i=y(0,-30,0);ee(o,i.p.clone().addScaledVector(i.n,.004),i.q,.04),d.hair=()=>Wl(`tenguHair`,()=>new Ae({color:t.hair,roughness:.6,sheen:.35,sheenRoughness:.45,sheenColor:new B(16777215),side:2,normalMap:au(),normalScale:new F(1.2,1.2)})),o.addRaw(`hair`,ne({y0:76,y1:284,cols:44,rows:8,pitchTop:24,pitchLow:e=>{let t=1-Math.min(1,Math.abs(e-180)/104),n=.5+.5*Math.cos(yl(e-180)*7);return vl(-14,-64,wl(0,.6,t))-12*n*(.3+.7*t)},off:(e,t)=>{let n=1-Math.min(1,Math.abs(t-180)/104),r=Math.max(0,Math.cos(yl(t-180)*7))*e;return .012+(.026+.03*n+.022*r)*Math.sin(Math.PI*Math.min(1,e*1.04))**.6}}));for(let[e,t,n]of[[0,-58,.052],[20,-51,.042],[-20,-51,.042]]){let i=y(e,t,n*.5);o.add(`hair`,new r(1,8,6),i.p,i.q,[n,n*1.1,n*.8])}let s=y(0,58,.035);o.add(`hat`,new bt(.056,.076,.085,12),s.p.clone().addScaledVector(s.n,.035),Ml(s.n)),o.add(`hat`,new r(.022,8,6),s.p.clone().addScaledVector(s.n,.082)),a.add(`robe2`,new b(.132,.018,5,20),m(Y(0,.82,-.24)),Nl(Math.PI/2-.22,0,0));for(let e of[1,-1])a.add(`robe2`,new bt(.016,.016,.26,6),m(Y(e*.09,.69,-.125)),Nl(-.14,0,e*.08));let l=new _(1,1);{let e=l.attributes.position;for(let t=0;t<e.count;t++){let n=1+.12*Math.sin(e.getX(t)*13)*Math.sin(e.getY(t)*11)*Math.sin(e.getZ(t)*12);e.setXYZ(t,e.getX(t)*n,e.getY(t)*n,e.getZ(t)*n)}l.computeVertexNormals()}for(let e=0;e<3;e++)for(let t of[1,-1])a.add(`pom`,l,m(Y(t*.09,.78-e*.07,-.108+e*.004)),null,.036-e*.002);d.wing=()=>Wl(`tenguWing`,()=>new Ae({color:2894392,roughness:.55,sheen:.5,sheenColor:new B(6974112),side:2}));let u=new f;u.moveTo(0,0),u.quadraticCurveTo(.12,.2,.3,.2),u.lineTo(.26,.14),u.lineTo(.28,.1),u.lineTo(.22,.06),u.lineTo(.23,.02),u.lineTo(.15,0),u.quadraticCurveTo(.07,-.04,0,0);let h=new k(u,{depth:.012,bevelEnabled:!0,bevelThickness:.006,bevelSize:.006,bevelSegments:1,curveSegments:6});for(let e of[1,-1])c.push({parent:`torso`,pos:m(Y(e*.08,.72,-.38)),quat:Nl(.2,e*-.55,0).multiply(new p().setFromAxisAngle(Y(0,1,0),e>0?0:Math.PI)),slots:(()=>{let e=new zl;return e.add(`wing`,h,[0,0,-.006]),e.merge()})(),side:e,amp:1.5})}else if(re===`oni`){d.horn=()=>nu(t.horn,.35),d.hair=()=>eu(t.hair,`hair`),d.tiger=()=>Wl(`oniTiger`,()=>new Ae({map:ju(`tigerCloth`,16168234,2761512),roughness:.7,sheen:.4,sheenColor:new B(16769184)}));for(let e of[1,-1]){let t=y(e*30,55,.02),n=t.n.clone().lerp(Y(0,1,0),.4).normalize(),r=new L(.045,.13,12,2);o.add(`horn`,r,t.p.clone().addScaledVector(n,.06),Ml(n)),o.add(`horn`,new b(.043,.01,4,12),t.p.clone().addScaledVector(n,.02),Ml(n).multiply(Nl(Math.PI/2,0,0)))}d.hair=()=>Wl(`oniHair`,()=>new Ae({color:t.hair,roughness:.6,sheen:.5,sheenRoughness:.5,sheenColor:new B(8949968),side:2})),o.addRaw(`hair`,ne({y0:-180,y1:180,cols:36,rows:5,pitchTop:89.5,pitchLow:(e,t)=>vl(8,30,Math.max(0,Math.cos(yl(e))))+(t%2?7:0),off:e=>.018+.012*Math.sin(Math.PI*e)}));let e=11,n=()=>(e=e*16807%2147483647)/2147483647;for(let[e,t]of[[0,76],[60,64],[-60,64],[105,46],[-105,46],[150,56],[-150,56],[180,34],[135,24],[-135,24],[180,70],[0,52],[90,76],[-90,76]]){let i=y(e,t,.012),a=.058+n()*.014;o.add(`hair`,new r(a,9,6),i.p)}let i=y(0,-30,0);te(o,i,.05,.032);for(let e of[1,-1]){let t=Y(1,0,0).applyQuaternion(i.q);o.add(`white`,new L(.012,.03,8),i.p.clone().addScaledVector(t,e*.03).addScaledVector(i.n,.004).add(Y(0,.004,0)),i.q.clone().multiply(Nl(Math.PI/2,0,0)).multiply(Nl(-Math.PI/2,0,0)))}for(let e of[1,-1]){let t=y(e*25,13,-.004);o.add(`hair`,Ol(.04,.014,.012,{ws:10,hs:6}),t.p,t.q.clone().multiply(Nl(0,0,e*.25)))}let a=y(0,-14,-.01);o.add(`fur`,new r(.03,12,10),a.p)}return{torso:a.merge(),head:o.merge(),eyes:s.merge(),eyeCenter:D,eyeFrames:x.map(e=>({p:e.p.clone(),n:e.n.clone()})),ears:c,tail:l,cuffs:re===`oni`,mats:e=>{let t={};for(let[e,n]of Object.entries(d))t[e]=n();return re===`tengu`&&(t.arm=t.robe),e.dark||(t.dark=e.nose),e.inner||(t.inner=e.fur),t}}}function Gu(e,t){let n=new se(.16,.28,6,3);n.translate(.08,0,0),n.rotateY(Math.PI/2);let r=n.attributes.uv;for(let e=0;e<r.count;e++)r.setX(e,r.getX(e)*.5);let i=n.clone(),a=i.attributes.uv;for(let e=0;e<a.count;e++)a.setX(e,.5+(.5-a.getX(e)));Ll(i);let o=ut([n,i],!1),s=o.attributes.position.array.slice(),c=new U(o,Nu(e).flag);c.position.set(t*du.flagX,.93,du.flagZ-.012),c.castShadow=!0;let l=t*1.3;return{mesh:c,update(e,t){let n=o.attributes.position,r=.01+Math.min(Math.abs(t),30)*.0011,i=7+Math.min(Math.abs(t),30)*.12;for(let t=0;t<n.count;t++){let a=s[t*3+2],o=s[t*3+1],c=-a/.16;n.setX(t,s[t*3]+Math.sin(e*i-c*5+o*3+l)*r*c*3),n.setZ(t,a+(Math.cos(e*i-c*5)-1)*r*c*.6)}n.needsUpdate=!0,o.computeVertexNormals()},dispose(){o.dispose()}}}var Ku={speed:0,steer:0,driftDir:0,boosting:!1,airborne:!1,gliding:!1,trickT:-1,trickType:`flip`,squash:0,spinOut:!1,time:0};function qu(e=`tanuki`,t=null){let r=Gc(e),i=Nu(r),a=new W;a.name=`kart-${r.id}`;let o=new W;o.name=`body`,a.add(o);let s=new W;s.name=`chassis`,o.add(s),Bl(Tu(),i,s,{noCast:[`emblem`,`lamp`,`tailLamp`,`gold`,`black`]});let c=new W;c.position.copy(du.wheelCenter),c.rotation.x=-(Math.PI-du.wheelTilt),s.add(c);let l=new W;c.add(l),Bl(Eu(),i,l,{noCast:[`gold`,`chrome`]});let u=[];for(let e of[`front`,`rear`]){let t=cu[e],n=uu(e),r=ru.rubber(e);for(let a of[1,-1]){let s=new W;s.position.set(a*t.x,t.R,t.z),o.add(s);let c=new W;s.add(c);let l=new W;a<0&&(l.rotation.y=Math.PI),c.add(l),Bl(n,{rubber:r,rim:i.rim,chrome:i.chrome,darkMetal:i.darkMetal},l,{noCast:[`rim`,`chrome`]}),u.push({kind:e,side:a,pivot:s,spin:c,R:t.R,baseY:t.R,droop:0})}}let d=[Gu(r,1),Gu(r,-1)];for(let e of d)s.add(e.mesh);let f=Uu(r);s.add(f.group);let m=new ve;m.name=`gliderMount`,m.position.set(-.3,1.08,-.2),m.rotation.set(0,0,-.12),s.add(m);let h=du.exhaust.map(e=>e.clone()),g=h.map(e=>e.clone()),_=u.filter(e=>e.kind===`rear`).sort((e,t)=>t.side-e.side).map(e=>Y(e.side*cu.rear.x,0,cu.rear.z)),v=_.map(e=>e.clone()),y={steer:0,drift:0,yaw:0,roll:0,pitch:0,droop:0,glide:0},b=new p,x=new p,S=new n,C=du.com.clone(),w=Y(),T=new xe,E=Y(),D=new xe,O={time:0,steer:0,drift:0,boost:!1,trick:0,glide:0,spin:!1,wheelMatrix:T,gripPoint:E,portrait:!1},k=(e,t=0)=>Number.isFinite(e)?e:t;function A(e,t={}){e=_l(k(e),0,.1);let n=k(t.time),r=k(t.speed),i=_l(k(t.steer),-1,1),a=_l(k(t.driftDir),-1,1),p=!!t.boosting,A=!!t.spinOut;y.steer=Tl(y.steer,i,12,e),y.drift=Tl(y.drift,a,8,e),y.yaw=Tl(y.yaw,-.35*a,7,e),y.roll=Tl(y.roll,-(i*.035+a*.06)*Math.min(1,Math.abs(r)/8+.2),6,e),y.pitch=Tl(y.pitch,p?-.07:0,5,e),y.droop=Tl(y.droop,t.airborne||t.gliding?.08:0,t.airborne||t.gliding?6:14,e),y.glide=Tl(y.glide,+!!t.gliding,6,e);for(let t of u)t.spin.rotation.x=(t.spin.rotation.x+r/t.R*e)%bl,t.pivot.position.y=t.baseY-y.droop,t.pivot.rotation.y=t.kind===`front`?-y.steer*.45:0;l.rotation.z=-y.steer*1.25-(A?Math.sin(n*20)*.5:0);let ee=(.0025+.002*(1-Math.min(1,Math.abs(r)/12))+(p?.004:0))*Math.sin(n*61)+.0015*Math.sin(n*37.3);s.position.set(p?Math.sin(n*47)*.004:0,ee+y.droop*.25,0),s.rotation.set(Math.sin(n*23)*.002,0,y.roll);let te=0,j=0,M=t.trickT;Number.isFinite(M)&&M>=0&&M<=1&&(te=(M<.5?4*M*M*M:1-(-2*M+2)**3/2)*bl,j=Math.sin(Math.PI*_l(M*1.15,0,1))),b.setFromEuler(S.set(y.pitch,y.yaw,0,`YXZ`)),te!==0&&(t.trickType===`spin`?x.setFromAxisAngle(Sl,te):t.trickType===`roll`?x.setFromAxisAngle(Cl,te):x.setFromAxisAngle(xl,te),b.multiply(x)),o.quaternion.copy(b);let N=_l(k(t.squash),0,1);o.scale.set(1+.08*N,1-.15*N,1+.08*N),w.set(C.x*o.scale.x,C.y*o.scale.y,C.z*o.scale.z).applyQuaternion(b),o.position.copy(C).sub(w),A&&(o.position.y+=Math.abs(Math.sin(n*10))*.02);for(let e of d)e.update(n,r);s.updateMatrix(),c.updateMatrix(),l.updateMatrix(),T.multiplyMatrices(c.matrix,l.matrix),E.copy(m.position),O.time=n,O.steer=y.steer,O.drift=y.drift,O.boost=p,O.trick=j,O.glide=y.glide,O.spin=A,f.pose(e,O),o.updateMatrix(),D.multiplyMatrices(o.matrix,s.matrix);for(let e=0;e<g.length;e++)g[e].copy(h[e]).applyMatrix4(D);for(let e=0;e<v.length;e++)v[e].copy(_[e]),v[e].y=-y.droop,v[e].applyMatrix4(o.matrix)}let ee={root:a,body:o,chassis:s,driver:f.group,gliderMount:m,exhaustPoints:g,rearWheelContacts:v,radius:1,character:r,animate:A,dispose(){a.parent?.remove(a);for(let e of d)e.dispose()}};if(A(1/60,Ku),t){let e={...t};if(e.glider){let t=gl(r.id);t.setOpen(e.glider),m.add(t.group),e.gliding=!0,ee.glider=t}for(let t=0;t<180;t++)A(1/60,{...e,time:(e.time??1)+t/60})}return ee}function Ju(e=`tanuki`){let t=Uu(Gc(e)),n=new W;n.add(t.group);let r={time:0,steer:0,drift:0,boost:!1,trick:0,glide:0,spin:!1,wheelMatrix:null,gripPoint:null,portrait:!1};return t.pose(1/60,{...r,time:.5}),{group:n,head:t.headPivot,headCenter:Iu.clone(),pose:(e,n)=>t.pose(e,{...r,...n})}}var Yu=Et({ITEM_IDS:()=>Xu,createAllItemsLineup:()=>Vd,createItemBox:()=>Bd,createItemBoxPreview:()=>Hd,createItemModel:()=>Pd,disposeItemResources:()=>Ud}),Xu=[`dango`,`daruma`,`shuriken`,`makibishi`,`manekineko`,`kanedarai`,`koban`],Zu=Math.PI*2,{clamp:Qu,lerp:$u}=ot,ed=(e=0,t=0,n=0)=>new I(e,t,n),td=`'Hiragino Mincho ProN','Yu Mincho','YuMincho','Noto Serif JP',serif`,nd=`'Hiragino Mincho ProN','Yu Mincho','YuMincho','Noto Serif JP',serif`,rd=new Map,id=new Map,ad=new Map;function od(e,t){let n=rd.get(e);return n||(n=t(),n.name=`item.`+e,rd.set(e,n)),n}function sd(e,t){let n=id.get(e);return n||id.set(e,n=t()),n}function cd(e,t,n,r,{linear:i=!1,wrap:a=!1}={}){let o=ad.get(e);if(o)return o;let s=document.createElement(`canvas`);return s.width=t,s.height=n,r(s.getContext(`2d`),t,n,s),o=new ft(s),o.colorSpace=i?``:oe,o.anisotropy=8,a&&(o.wrapS=o.wrapT=Re),ad.set(e,o),o}function ld(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function ud(e,t,n,r){let i=e.measureText(t),a=i.actualBoundingBoxAscent||0,o=i.actualBoundingBoxDescent||0,s=i.actualBoundingBoxLeft||0,c=i.actualBoundingBoxRight||0;e.textAlign=`left`,e.textBaseline=`alphabetic`,e.fillText(t,n-(c-s)/2+(s-0)*0,r+(a-o)/2)}function dd(e,t,n,r){let i=sd(e,()=>t().merge()),a=new W;for(let[e,t]of i){let i=new U(t,n()[e]);i.castShadow=(r?.cast??!0)&&!(r?.noCast||[]).includes(e),i.receiveShadow=!0,i.name=e,a.add(i)}return a}var fd={gold:()=>od(`gold`,()=>new Ae({color:16762442,metalness:1,roughness:.2,clearcoat:.4,clearcoatRoughness:.1})),bamboo:()=>od(`bamboo`,()=>new R({color:14269564,roughness:.55})),ink:()=>od(`ink`,()=>new R({color:2760738,roughness:.5})),pinkNose:()=>od(`pinkNose`,()=>new Ae({color:15764128,roughness:.3,clearcoat:1})),red:()=>od(`lacquerRed`,()=>new Ae({color:14165546,roughness:.3,clearcoat:1,clearcoatRoughness:.08}))},pd=[10471270,15459798,16097974];function md(e){return od(`mochi`+e,()=>{let t=new B(pd[e]);return new Ae({color:t,roughness:.42,clearcoat:.55,clearcoatRoughness:.35,sheen:.6,sheenRoughness:.4,sheenColor:t.clone().lerp(new B(16777215),.6)})})}function hd({count:e=3}={}){e=Qu(Math.round(e),0,3);let t=new W,n=sd(`dangoBall`,()=>{let e=new r(.086,22,15);return e.scale(1,.9,1),e}),i=sd(`dangoStick`,()=>{let e=new zl;return e.add(`bamboo`,new bt(.011,.012,.6,8),[0,.3,0]),e.add(`bamboo`,new L(.011,.03,8),[0,.615,0]),e.add(`bamboo`,new bt(.013,.013,.006,8),[0,.07,0]),e.merge().get(`bamboo`)}),a=new U(i,fd.bamboo());a.castShadow=!0,t.add(a);for(let r=0;r<e;r++){let e=new U(n,md(r));e.position.y=.2+r*.152,e.rotation.y=r*1.3,e.castShadow=!0,e.receiveShadow=!0,t.add(e)}return t.userData.item=`dango`,t}function gd(){return cd(`daruma`,1024,512,(e,t,n)=>{let r=e.createLinearGradient(0,0,0,n);r.addColorStop(0,`#e2342a`),r.addColorStop(.6,`#d0251f`),r.addColorStop(1,`#a81b18`),e.fillStyle=r,e.fillRect(0,0,t,n);let i=t*.5,a=n*.31;e.strokeStyle=`#f2c65a`,e.lineWidth=9,e.lineCap=`round`;for(let r of[-1,1]){let a=i+r*t*.22;for(let t=0;t<3;t++){let i=n*(.28+t*.2);e.beginPath();for(let n=0;n<Zu*1.4;n+=.1){let o=6+n*7.5,s=a+r*Math.cos(n+t)*o,c=i+Math.sin(n+t)*o*.9;n===0?e.moveTo(s,c):e.lineTo(s,c)}e.stroke()}e.beginPath(),e.moveTo(i+r*t*.14,n*.12),e.quadraticCurveTo(i+r*t*.19,n*.45,i+r*t*.13,n*.86),e.stroke()}e.fillStyle=`#f2c65a`,e.font=`bold 170px ${td}`,ud(e,`寿`,0*t+2,n*.52),ud(e,`寿`,t-2,n*.52),e.fillStyle=`#f7ecd6`,e.beginPath(),e.ellipse(i,a,t*.1,n*.19,0,0,Zu),e.fill(),e.strokeStyle=`#e8c070`,e.lineWidth=6,e.stroke(),e.strokeStyle=`#1f1a1c`,e.lineCap=`round`;for(let t of[-1,1])e.lineWidth=10,e.beginPath(),e.moveTo(i+t*20,a-n*.1),e.quadraticCurveTo(i+t*52,a-n*.16,i+t*84,a-n*.1),e.stroke();for(let t of[-1,1]){let r=i+t*46,o=a-n*.025;e.fillStyle=`#fbf8f0`,e.beginPath(),e.ellipse(r,o,34,33,0,0,Zu),e.fill(),e.fillStyle=`#1b1618`,e.beginPath(),e.ellipse(r,o+2,29,29,0,0,Zu),e.fill(),e.fillStyle=`rgba(255,255,255,0.95)`,e.beginPath(),e.arc(r+10,o-8,8,0,Zu),e.fill(),e.beginPath(),e.arc(r-9,o+12,3.5,0,Zu),e.fill()}for(let t of[-1,1]){let r=e.createRadialGradient(i+t*70,a+n*.06,2,i+t*70,a+n*.06,22);r.addColorStop(0,`rgba(255,120,130,0.8)`),r.addColorStop(1,`rgba(255,120,130,0)`),e.fillStyle=r,e.fillRect(i+t*70-24,a+n*.06-24,48,48)}e.fillStyle=`#1f1a1c`,e.beginPath(),e.ellipse(i,a+n*.045,6,4.5,0,0,Zu),e.fill(),e.fillStyle=`#b8202a`,e.beginPath(),e.moveTo(i-22,a+n*.08),e.quadraticCurveTo(i,a+n*.08+4,i+22,a+n*.08),e.quadraticCurveTo(i+18,a+n*.08+30,i,a+n*.08+31),e.quadraticCurveTo(i-18,a+n*.08+30,i-22,a+n*.08),e.fill(),e.fillStyle=`#f07a86`,e.beginPath(),e.ellipse(i,a+n*.08+22,11,7,0,0,Zu),e.fill(),e.strokeStyle=`#d9a842`,e.lineWidth=4;for(let t of[-1,1])for(let r=0;r<2;r++)e.beginPath(),e.moveTo(i+t*(40+r*10),a+n*(.1+r*.03)),e.quadraticCurveTo(i+t*(58+r*10),a+n*(.11+r*.03),i+t*(70+r*8),a+n*(.085+r*.03)),e.stroke();let o=n*.68;e.strokeStyle=`#f2c65a`,e.lineWidth=7,e.beginPath(),e.ellipse(i,o,78,70,0,0,Zu),e.stroke(),e.font=`bold 118px ${td}`,e.lineWidth=10,e.strokeStyle=`#7a1612`,e.fillStyle=`#ffd36a`;let s=e.measureText(`福`),c=i-((s.actualBoundingBoxRight||0)-(s.actualBoundingBoxLeft||0))/2,l=o+((s.actualBoundingBoxAscent||0)-(s.actualBoundingBoxDescent||0))/2;e.textAlign=`left`,e.textBaseline=`alphabetic`,e.strokeText(`福`,c,l),e.fillText(`福`,c,l)})}function _d(){return sd(`daruma`,()=>{let e=[];for(let t=0;t<=28;t++){let n=t/28*Math.PI,r=-Math.cos(n)*.4,i=1+.08*Math.cos(n),a=Math.sin(n)*.335*i;(t===0||t===28)&&(a=0),e.push([a,r])}let t=kl(e,40,Math.PI,Zu),n=t.attributes.position;for(let e=0;e<n.count;e++){let t=n.getX(e),r=n.getY(e),i=n.getZ(e),a=Math.max(0,Math.cos(Math.atan2(t,i)*2.4))*Math.max(0,1-Math.abs((r-.2)/.17)**2);i>0&&n.setZ(e,i*(1-.07*a))}return t.computeVertexNormals(),Dl(t),t})}function vd(){let e=new W,t=od(`daruma`,()=>new Ae({map:gd(),roughness:.38,clearcoat:1,clearcoatRoughness:.08})),n=new U(_d(),t);return n.castShadow=!0,n.receiveShadow=!0,e.add(n),e.userData.item=`daruma`,e.userData.radius=.36,e}function yd(e=1,t=!0){let n=new f,r=.335*e,i=.085*e;for(let e=0;e<4;e++){let t=e/4*Zu+Math.PI/4,a=t+Math.PI/4,o=[Math.cos(t)*r,Math.sin(t)*r],s=[Math.cos(a)*i,Math.sin(a)*i],c=[Math.cos(t+.2)*r*.42,Math.sin(t+.2)*r*.42];e===0?n.moveTo(o[0],o[1]):n.lineTo(o[0],o[1]),n.quadraticCurveTo(c[0],c[1],s[0],s[1]);let l=t+Math.PI/2,u=[Math.cos(l-.2)*r*.42,Math.sin(l-.2)*r*.42],d=[Math.cos(l)*r,Math.sin(l)*r];n.quadraticCurveTo(u[0],u[1],d[0],d[1])}if(n.closePath(),t){let t=new Ct;t.absarc(0,0,.045*e,0,Zu,!0),n.holes.push(t)}return n}function bd(){let e=new W,t=od(`steel`,()=>new Ae({color:11845321,metalness:1,roughness:.2,clearcoat:.6,clearcoatRoughness:.12})),n=od(`shurikenEdge`,()=>new R({color:8230822,metalness:.8,roughness:.22,emissive:2077951,emissiveIntensity:1.05})),r=od(`steelDark`,()=>new R({color:4870232,metalness:.9,roughness:.35})),i=sd(`shurikenBody`,()=>{let e=new k(yd(),{depth:.014,bevelEnabled:!0,bevelThickness:.012,bevelSize:.016,bevelSegments:1,curveSegments:10});return e.translate(0,0,-.007),e.rotateX(-Math.PI/2),e}),a=sd(`shurikenDetails`,()=>{let e=new zl;for(let t of[.02,-.02]){e.add(`dark`,new b(.07,.007,6,28),[0,t,0],[Math.PI/2,0,0]);for(let n=0;n<4;n++){let r=n/4*Zu+Math.PI/4,i=ed(Math.cos(r),0,-Math.sin(r));e.add(`dark`,new Qe(.16,.004,.008),i.clone().multiplyScalar(.17).setY(t),[0,r,0])}}return e.merge().get(`dark`)}),o=new U(i,[t,n]);return o.castShadow=!0,o.receiveShadow=!0,e.add(o),e.add(new U(a,r)),e.userData.item=`shuriken`,e}function xd(){return sd(`caltrop`,()=>{let e=new zl,t=.17,n=[ed(0,1,0)],i=Math.acos(-1/3);for(let e=0;e<3;e++){let t=e/3*Zu;n.push(ed(Math.sin(i)*Math.cos(t),Math.cos(i),Math.sin(i)*Math.sin(t)))}let a=new L(.032,t,7,2);a.translate(0,t/2,0);for(let t of n)e.add(`iron`,a,[0,0,0],new p().setFromUnitVectors(ed(0,1,0),t));e.add(`iron`,new _(.038,1),[0,0,0]);for(let i of n)e.add(`tip`,new r(.012,6,4),i.clone().multiplyScalar(t*.93));let o=e.merge();for(let e of o.values())e.translate(0,t/3,0);return o})}function Sd(){return cd(`redGlow`,128,128,(e,t,n)=>{let r=e.createRadialGradient(t/2,n/2,0,t/2,n/2,t/2);r.addColorStop(0,`rgba(255,60,40,0.9)`),r.addColorStop(.45,`rgba(255,40,20,0.35)`),r.addColorStop(1,`rgba(255,20,10,0)`),e.fillStyle=r,e.fillRect(0,0,t,n)})}function Cd({icon:e=!1}={}){let t=new W,n=od(`iron`,()=>new R({color:4539982,metalness:.8,roughness:.5})),r=od(`ironTip`,()=>new R({color:16734784,emissive:16722448,emissiveIntensity:2.2,roughness:.4})),i=sd(`makibishiCluster`,()=>{let e=xd(),t=new zl;for(let[n,r,i]of[[0,0,.3],[.17,.08,1.4],[-.14,.12,2.3],[.03,-.17,3.9]])t.add(`iron`,e.get(`iron`),[n,0,r],[0,i,0]),t.add(`tip`,e.get(`tip`),[n,0,r],[0,i,0]);return t.merge()}),a=new U(i.get(`iron`),n);if(a.castShadow=!0,a.receiveShadow=!0,t.add(a),t.add(new U(i.get(`tip`),r)),!e){let e=new U(sd(`glowDisc`,()=>new se(.95,.95).rotateX(-Math.PI/2)),od(`redGlowDisc`,()=>new lt({map:Sd(),color:new B(.85,.22,.16),transparent:!0,depthWrite:!1,blending:2,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2})));e.position.y=.006,e.renderOrder=1,e.userData.glow=!0,t.add(e)}return t.userData.item=`makibishi`,t}var wd=.15,Td=.225;function Ed(){if(ad.has(`kobanMaps`))return ad.get(`kobanMaps`);let e=document.createElement(`canvas`);e.width=512,e.height=384;let t=e.getContext(`2d`),n=document.createElement(`canvas`);n.width=512,n.height=384;let r=n.getContext(`2d`);t.fillStyle=`#ffffff`,t.fillRect(0,0,512,384),r.fillStyle=`#808080`,r.fillRect(0,0,512,384);for(let e of[0,1]){let n=e*256,i=n+128,a=124.16,o=186.24;r.save(),r.beginPath(),r.ellipse(i,192,a*.86,o*.88,0,0,Zu),r.clip();for(let e=0;e<384;e+=7)r.fillStyle=`#6a6a6a`,r.fillRect(n,e,256,3);r.restore(),r.strokeStyle=`#d8d8d8`,r.lineWidth=12,r.beginPath(),r.ellipse(i,192,a*.93,o*.94,0,0,Zu),r.stroke(),r.strokeStyle=`#5a5a5a`,r.lineWidth=3,r.beginPath(),r.ellipse(i,192,a*.86,o*.885,0,0,Zu),r.stroke();let s=e===0?[192-o*.66,314.9184]:[192];for(let e of s){r.fillStyle=`#b8b8b8`,r.beginPath(),r.ellipse(i,e,26,30,0,0,Zu),r.fill(),r.fillStyle=`#e8e8e8`;for(let t of[-11,0,11])r.beginPath(),r.ellipse(i+t,e+8,6,9,t*.03,0,Zu),r.fill();for(let t of[-12,0,12])for(let n=0;n<3;n++)r.beginPath(),r.arc(i+t,e-6-n*6,2.6,0,Zu),r.fill();t.strokeStyle=`rgba(150,100,30,0.55)`,t.lineWidth=2,t.beginPath(),t.ellipse(i,e,26,30,0,0,Zu),t.stroke()}e===0&&(t.fillStyle=`#2a1a12`,t.font=`bold 58px ${nd}`,ud(t,`壱`,i,140),ud(t,`両`,i,200),t.font=`bold 32px ${nd}`,ud(t,`光次`,i,254),t.lineWidth=4,t.strokeStyle=`#2a1a12`,t.beginPath(),t.moveTo(i-22,284),t.bezierCurveTo(i-5,270,i+6,296,i+24,278),t.stroke());let c=t.createRadialGradient(i-30,142,10,i,192,o);c.addColorStop(0,`rgba(255,255,240,0.0)`),c.addColorStop(1,`rgba(200,150,60,0.18)`),t.fillStyle=c,t.fillRect(n,0,256,384)}let i=ql(n,2.4,!1),a=new ft(e);a.colorSpace=oe,a.anisotropy=8;let o=new ft(i);o.colorSpace=``,o.anisotropy=8;let s={map:a,nmap:o};return ad.set(`kobanMaps`,s),s}function Dd(){return sd(`koban`,()=>{let e=new f;e.absellipse(0,0,wd,Td,0,Zu,!1,0);let t=.011,n=new k(e,{depth:.014,bevelEnabled:!0,bevelThickness:t,bevelSize:t,bevelSegments:2,curveSegments:30});n.translate(0,0,-.014/2);let r=n.attributes.uv,i=n.attributes.normal,a=n.attributes.position,o=n.groups[0];for(let e=0;e<a.count;e++){let t=e>=o.start&&e<o.start+o.count,n=a.getX(e),s=a.getY(e),c=(n+wd)/(2*wd),l=(s+Td)/(2*Td);t?i.getZ(e)>0?r.setXY(e,c*.5,l):r.setXY(e,.5+(1-c)*.5,l):r.setXY(e,.01,.5)}return n.clearGroups(),n})}function Od(){return od(`koban`,()=>{let{map:e,nmap:t}=Ed();return new Ae({color:16761924,metalness:1,roughness:.2,map:e,normalMap:t,normalScale:new F(1,1),clearcoat:.5,clearcoatRoughness:.12})})}function kd(){let e=new W,t=new U(Dd(),Od());return t.castShadow=!0,t.receiveShadow=!0,e.add(t),e.userData.item=`koban`,e}function Ad(){return{white:od(`manekiWhite`,()=>new Ae({color:15262425,roughness:.28,clearcoat:1,clearcoatRoughness:.06})),red:fd.red(),gold:fd.gold(),ink:fd.ink(),pink:fd.pinkNose(),inner:od(`manekiInner`,()=>new Ae({color:15899304,roughness:.35,clearcoat:1})),orange:od(`manekiOrange`,()=>new Ae({color:15767868,roughness:.3,clearcoat:1})),black:od(`manekiBlack`,()=>new Ae({color:3485743,roughness:.3,clearcoat:1})),cushion:od(`manekiCushion`,()=>new Ae({color:9184320,roughness:.65,sheen:.8,sheenColor:new B(16751288),sheenRoughness:.4})),koban:Od(),blush:od(`manekiBlush`,()=>new lt({color:16751272,transparent:!0,opacity:.7,depthWrite:!1}))}}function jd(){let e=new zl,t=(e,t,r,i)=>new p().setFromEuler(new n(e,t,r,i||`XYZ`));e.add(`cushion`,new Jc(.5,.07,.46,2,.03),[0,.035,0]);for(let[t,n]of[[.24,.22],[-.24,.22],[.24,-.22],[-.24,-.22]])e.add(`gold`,new r(.018,8,6),[t,.05,n]),e.add(`gold`,new L(.014,.05,6),[t*1.07,.03,n*1.07]);e.add(`white`,Ol(.17,.19,.15,{ws:20,hs:14,deform:e=>{e.y<0&&(e.x*=1.12,e.z*=1.12)}}),[0,.25,0]);for(let t of[1,-1])e.add(`white`,new r(.1,14,10),[t*.12,.14,-.02],null,[1,.9,1.15]),e.add(`white`,new r(.055,12,8),[t*.07,.1,.14],null,[1,.75,1.3]);e.add(`white`,Ol(.2,.17,.18,{ws:26,hs:18,deform:e=>{e.y<0&&(e.x*=1+.12*Math.min(1,-e.y/.17))}}),[0,.57,.01]);for(let n of[1,-1])e.add(`white`,new L(.075,.13,14),[n*.12,.73,0],t(0,0,-n*.35),[1,1,.55]),e.add(`inner`,new L(.05,.09,12),[n*.12,.72,.022],t(0,0,-n*.35),[1,1,.3]);e.add(`orange`,new r(1,14,10),[.1,.68,.06],t(-.6,.5,0),[.07,.06,.03]),e.add(`black`,new r(1,14,10),[-.11,.66,.02],t(-.3,-.9,0),[.06,.05,.03]),e.add(`orange`,new r(1,12,8),[-.09,.32,-.12],t(.3,-2.4,0),[.07,.07,.03]);for(let n of[1,-1])e.add(`ink`,new b(.03,.007,5,12,Math.PI),[n*.075,.585,.172],t(-.25,n*.35,0)),e.add(`blush`,new et(.03,12),[n*.12,.54,.155],t(-.1,n*.6,0),[1.2,.8,1]);e.add(`pink`,new r(.016,10,8),[0,.555,.19],null,[1.3,.9,1]);for(let n of[1,-1])e.add(`ink`,new b(.016,.004,4,10,Math.PI),[n*.016,.535,.186],t(0,0,Math.PI));for(let t of[1,-1])for(let n=0;n<3;n++){let r=ed(t,.15-n*.15,.25).normalize();e.add(`ink`,new bt(.003,.002,.12,4),ed(t*.1,.54-n*.012,.15).addScaledVector(r,.04),new p().setFromUnitVectors(ed(0,1,0),r))}e.add(`red`,new b(.14,.022,8,28),[0,.43,0],t(Math.PI/2-.15,0,0),[1,1,1]),e.add(`gold`,new r(.038,16,12),[0,.39,.155]),e.add(`ink`,new b(.038,.004,4,16,Math.PI),[0,.385,.158],t(0,0,Math.PI));let i=ed(.13,.4,.06),a=ed(.2,.66,.1);{let t=a.clone().sub(i),n=new De(.05,t.length(),4,12);e.add(`white`,n,i.clone().addScaledVector(t,.5),new p().setFromUnitVectors(ed(0,1,0),t.clone().normalize())),e.add(`white`,new r(.058,14,10),a.clone().add(ed(0,.02,.01)),null,[1,1.05,.85]),e.add(`inner`,new r(.02,8,6),a.clone().add(ed(0,.015,.058)),null,[1,1,.5])}let o=ed(-.13,.36,.08),s=ed(-.08,.26,.2);{let t=s.clone().sub(o);e.add(`white`,new De(.048,t.length(),4,12),o.clone().addScaledVector(t,.5),new p().setFromUnitVectors(ed(0,1,0),t.clone().normalize()))}let c=Dd().clone();return c.scale(.62,.62,.8),e.add(`koban`,c,[0,.25,.2],t(-.12,0,0)),e.add(`white`,new r(.05,12,10),s.clone().add(ed(0,.02,.03)),null,[1,.9,.9]),e.add(`white`,new b(.07,.03,8,16,Math.PI*1.2),[0,.12,-.17],t(0,0,.4)),e}function Md(){let e=Ad(),t=dd(`maneki`,jd,()=>e,{noCast:[`ink`,`blush`,`pink`,`inner`]});return t.userData.item=`manekineko`,t}function Nd(){let e=sd(`kanedarai`,()=>{let e=kl([[0,0],[.08,0],[.085,.006],[.09,0],[.15,0],[.155,.006],[.16,0],[.25,0],[.268,.004],[.28,.014],[.33,.08],[.38,.15],[.415,.205],[.432,.232],[.442,.247],[.452,.254],[.461,.25],[.463,.24],[.456,.232],[.444,.236],[.426,.228],[.405,.2],[.37,.15],[.32,.084],[.272,.022],[.255,.013],[.16,.012],[.155,.018],[.15,.012],[.09,.012],[.085,.018],[.08,.012],[0,.012]],40);return e.rotateX(Math.PI),e.translate(0,.254,0),e}),t=od(`kanedarai`,()=>new R({color:14859628,metalness:.95,roughness:.36,side:2})),n=new W,r=new U(e,t);return r.castShadow=!0,r.receiveShadow=!0,n.add(r),n.userData.item=`kanedarai`,n}function Pd(e=`dango`,t={}){switch(e){case`dango`:return hd(t);case`daruma`:return vd(t);case`shuriken`:return bd(t);case`makibishi`:return Cd(t);case`manekineko`:return Md(t);case`kanedarai`:return Nd(t);case`koban`:return kd(t);default:throw Error(`unknown item id: `+e)}}var Fd=`
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vP;
  #include <fog_pars_vertex>
  void main() {
    vP = position;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vV = cameraPosition - wp.xyz;
    vec4 mvPosition = viewMatrix * wp;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`,Id=`
  uniform float uTime;
  uniform float uHalf;
  uniform float uAlpha;
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vP;
  #include <fog_pars_fragment>
  vec3 hsv2rgb(vec3 c) {
    vec3 p = abs(fract(c.xxx + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
    return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
  }
  void main() {
    vec3 n = normalize(vN);
    float vl = length(vV);
    vec3 v = vl > 1e-5 ? vV / vl : vec3(0.0, 0.0, 1.0);
    float ndv = clamp(abs(dot(n, v)), 0.0, 1.0);
    float fres = pow(max(1.0 - ndv, 0.0), 2.2);
    // distance to cube edges (object space)
    vec3 d = uHalf - abs(vP);
    float m1 = min(d.x, min(d.y, d.z));
    float m3 = max(d.x, max(d.y, d.z));
    float m2 = d.x + d.y + d.z - m1 - m3; // second smallest
    float edge = 1.0 - smoothstep(0.0, 0.16, max(m2, 0.0));
    float hue = fract(uTime * 0.08 + fres * 0.55 + dot(vP, vec3(0.45, 0.62, 0.31)) + edge * 0.15);
    vec3 rainbow = hsv2rgb(vec3(hue, 0.78, 1.0));
    vec3 col = rainbow * (0.2 + 1.15 * fres + 1.65 * edge);
    col += vec3(1.0, 0.96, 0.9) * pow(fres, 5.0) * 0.35;
    float a = clamp(0.12 + 0.6 * fres + 0.7 * edge, 0.0, 0.9) * uAlpha;
    gl_FragColor = vec4(col, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`,Ld=null;function Rd(){if(Ld)return Ld;let e=fe.merge([G.fog,{uTime:{value:0},uHalf:{value:.55},uAlpha:{value:1}}]),t=t=>{let n=new P({uniforms:e,vertexShader:Fd,fragmentShader:Id,transparent:!0,depthWrite:!1,side:t,fog:!0});return n.uniforms=e,n.name=`item.boxGlass`+t,n},n=cd(`fuGlyph`,256,256,(e,t,n)=>{let r=t/2,i=n/2,a=e.createRadialGradient(r,i,10,r,i,t/2);a.addColorStop(0,`rgba(255,220,120,0.55)`),a.addColorStop(.5,`rgba(255,190,60,0.18)`),a.addColorStop(1,`rgba(255,170,40,0)`),e.fillStyle=a,e.fillRect(0,0,t,n),e.font=`bold 170px ${td}`;let o=e.createLinearGradient(0,i-80,0,i+80);o.addColorStop(0,`#fff6c8`),o.addColorStop(.45,`#ffd14a`),o.addColorStop(1,`#e89a1c`),e.lineWidth=12,e.strokeStyle=`rgba(140,60,10,0.9)`;let s=e.measureText(`福`),c=r-((s.actualBoundingBoxRight||0)-(s.actualBoundingBoxLeft||0))/2,l=i+((s.actualBoundingBoxAscent||0)-(s.actualBoundingBoxDescent||0))/2;e.textAlign=`left`,e.textBaseline=`alphabetic`,e.strokeText(`福`,c,l),e.fillStyle=o,e.fillText(`福`,c,l)}),r=cd(`sparkle`,64,64,(e,t,n)=>{let r=t/2,i=n/2,a=e.createRadialGradient(r,i,0,r,i,t/2);a.addColorStop(0,`rgba(255,255,255,1)`),a.addColorStop(.2,`rgba(255,245,210,0.8)`),a.addColorStop(1,`rgba(255,230,160,0)`),e.fillStyle=a,e.fillRect(0,0,t,n),e.fillStyle=`rgba(255,255,255,0.95)`,e.beginPath(),e.moveTo(r,2),e.quadraticCurveTo(r+3,i-3,t-2,i),e.quadraticCurveTo(r+3,i+3,r,n-2),e.quadraticCurveTo(r-3,i+3,2,i),e.quadraticCurveTo(r-3,i-3,r,2),e.fill()});return Ld={back:t(1),front:t(0),uniforms:e,fu:new A({map:n,color:new B(1.55,1.35,1),transparent:!0,depthWrite:!1,fog:!0}),spark:new le({map:r,color:new B(1.6,1.45,1.2),size:.15,transparent:!0,depthWrite:!1,blending:2,sizeAttenuation:!0})},Ld.fu.name=`item.boxFu`,Ld.spark.name=`item.boxSpark`,Ld}var zd=0;function Bd(){let e=Rd(),t=new W;t.name=`itemBox`;let n=new W;t.add(n);let r=new W;n.add(r);let i=sd(`boxGeo`,()=>new Jc(1.1,1.1,1.1,4,.16)),a=new U(i,e.back);a.renderOrder=10;let o=new U(i,e.front);o.renderOrder=12,r.add(a,o);let s=new D(e.fu);s.scale.setScalar(.78),s.renderOrder=11,n.add(s);let c=new Float32Array(30),l=new we;l.setAttribute(`position`,new st(c,3));let u=new yt(l,e.spark);u.renderOrder=11,u.frustumCulled=!1,n.add(u);let d=[],f=ld(7);for(let e=0;e<10;e++)d.push({a:f()*Zu,y:(f()-.5)*.7,rr:.18+f()*.2,sp:.6+f()*.9});let p=zd++*1.618%10;function m(t,i){let a=i+p;e.uniforms.uTime.value=i,r.rotation.set(.42,a*.9,.28),n.position.y=Math.sin(a*2.1)*.08,s.material.rotation=Math.sin(a*1.7)*.08;let o=.74+Math.sin(a*3.1)*.04;s.scale.setScalar(o);for(let e=0;e<10;e++){let t=d[e],n=t.a+a*t.sp;c[e*3]=Math.cos(n)*t.rr,c[e*3+1]=t.y+Math.sin(a*1.3+e)*.08,c[e*3+2]=Math.sin(n)*t.rr}l.attributes.position.needsUpdate=!0}return m(0,0),{group:t,update:m,setOpacity(t){e.uniforms.uAlpha.value=t},dispose(){t.parent?.remove(t),l.dispose()}}}function Vd(){let e=new W,t=[Pd(`dango`,{count:3}),Pd(`dango`,{count:2}),Pd(`dango`,{count:1}),Pd(`daruma`),Pd(`shuriken`),Pd(`makibishi`),Pd(`manekineko`),Pd(`kanedarai`),Pd(`koban`)],n=0;for(let r of t){let t=new W;t.add(r),t.updateMatrixWorld(!0);let i=new ye().setFromObject(t),a=r.userData.item;(a===`daruma`||a===`koban`)&&(t.position.y=-i.min.y),a===`shuriken`&&(t.position.y=.3),a===`kanedarai`&&(t.position.y=.6),t.position.x=n-i.min.x,n+=i.max.x-i.min.x+.3,e.add(t)}let r=Bd();return r.group.position.set(n+.6,.9,0),e.add(r.group),e.userData.update=r.update,e}function Hd(){let e=Bd(),t=new W;return e.group.position.y=1,t.add(e.group),{group:t,update:e.update}}function Ud(){for(let e of id.values())if(e instanceof Map)for(let t of e.values())t.dispose?.();else e.dispose?.();for(let e of rd.values())e.dispose();for(let e of ad.values())if(e.isTexture)e.dispose();else for(let t of Object.values(e))t.dispose?.();Ld&&=(Ld.back.dispose(),Ld.front.dispose(),Ld.fu.dispose(),Ld.spark.dispose(),null),id.clear(),rd.clear(),ad.clear()}var Wd={shu:`#d8401f`,shuD:`#a02a12`,shuL:`#f26a3f`,gold:`#e0b04a`,goldL:`#f8dd8c`,goldD:`#a8781f`,sumi:`#1d1a19`,washi:`#f7f1e3`,ai:`#243a6b`,aiD:`#16244a`,sakura:`#f4a7b9`,sakuraL:`#ffd9e2`,sakuraD:`#d9738e`,matcha:`#7da34a`},Gd=`#2a1d17`,X=e=>Math.round(e*100)/100,Kd=e=>`data:image/svg+xml,${encodeURIComponent(e)}`,qd=e=>`url("${Kd(e)}")`,Jd=(e,t,n,r=``)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${e}" height="${t}" viewBox="0 0 ${e} ${t}"${r}>${n}</svg>`;function Yd({r:e=24,bg:t=Wd.ai,fg:n=`#2e4a86`,rings:r=4,sw:i=1.4}={}){let a=e*2,o=e,s=(a,o)=>{let s=`<circle cx="${a}" cy="${o}" r="${X(e-i/2)}" fill="${t}" stroke="${n}" stroke-width="${i}"/>`;for(let t=1;t<r;t++)s+=`<circle cx="${a}" cy="${o}" r="${X((e-i/2)*(1-t/r))}" fill="none" stroke="${n}" stroke-width="${i}"/>`;return s};return Jd(a,o,`<rect width="${a}" height="${o}" fill="${t}"/>`+s(e,-o/2)+s(0,0)+s(a,0)+s(e,o/2)+s(0,o)+s(a,o)+s(e,o*1.5))}function Xd({s:e=36,stroke:t=`rgba(224,176,74,0.5)`,sw:n=1.2,bg:r=null}={}){let i=e*Math.sqrt(3)/2,a=e,o=2*i,s=``,c=(e,t)=>{s+=`M${X(e[0])} ${X(e[1])}L${X(t[0])} ${X(t[1])}`},l=(e,t,n)=>{let r=[(e[0]+t[0]+n[0])/3,(e[1]+t[1]+n[1])/3];c(e,t),c(t,n),c(n,e),c(e,r),c(t,r),c(n,r)},u=t=>(t%2+2)%2?e/2:0;for(let t=-1;t<=2;t++){let n=t*i,r=(t+1)*i,a=u(t),o=u(t+1);for(let t=-2;t<=2;t++)l([t*e+a,n],[(t+1)*e+a,n],[(t+.5)*e+a,r]),l([t*e+o,r],[(t+1)*e+o,r],[(t+.5)*e+o,n])}let d=(r?`<rect width="${a}" height="${X(o)}" fill="${r}"/>`:``)+`<path d="${s}" fill="none" stroke="${t}" stroke-width="${n}" stroke-linecap="round"/>`;return`<svg xmlns="http://www.w3.org/2000/svg" width="${a}" height="${X(o)}" viewBox="0 0 ${a} ${X(o)}">${d}</svg>`}function Zd({c:e=22,p:t=44,a:n=Wd.ai,b:r=Wd.washi}={}){let i=t/4,a=(r,a)=>`<path d="M${r} ${a}L${r+e/2} ${a+i}L${r+e} ${a}L${r+e} ${a+t/2}L${r+e/2} ${a+i+t/2}L${r} ${a+t/2}Z" fill="${n}"/>`,o=`<rect width="${2*e}" height="${t}" fill="${r}"/>`+a(0,-t)+a(0,0)+a(0,t)+a(e,-t/2)+a(e,t/2)+a(e,1.5*t);return Jd(2*e,t,o)}function Qd({size:e=256,strength:t=1,seed:n=7}={}){let r=t;return Jd(e,e,`<filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${n}" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.36  0 0 0 0 0.29  0 0 0 0 0.2  0 0 0 ${X(.3*r)} ${X(-.12*r)}"/></filter><filter id="f" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.01 0.22" numOctaves="2" seed="${n+3}" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.24  0 0 0 ${X(.4*r)} ${X(-.24*r)}"/></filter><rect width="100%" height="100%" filter="url(#g)"/><rect width="100%" height="100%" filter="url(#f)"/>`)}function $d({color:e=Wd.shu,seed:t=4}={}){return`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="120" viewBox="0 0 640 120" preserveAspectRatio="none">${`<defs><filter id="b" x="-4%" y="-25%" width="108%" height="150%"><feTurbulence type="fractalNoise" baseFrequency="0.016 0.2" numOctaves="3" seed="${t}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="15" xChannelSelector="R" yChannelSelector="G"/></filter><mask id="m"><rect width="640" height="120" fill="#fff"/><g stroke="#000" stroke-linecap="round" fill="none"><path d="M430 40 L618 44" stroke-width="2.2"/><path d="M470 56 L630 58" stroke-width="1.6"/><path d="M500 70 L626 67" stroke-width="2.6"/><path d="M455 83 L600 86" stroke-width="1.8"/><path d="M540 32 L632 36" stroke-width="1.4"/></g></mask></defs><g filter="url(#b)" mask="url(#m)" fill="${e}"><path d="M30 34C90 18 200 22 330 22C450 22 540 16 592 28C618 34 630 50 626 62C622 78 596 90 548 94C440 102 300 96 190 100C110 103 50 106 26 92C6 80 8 46 30 34Z"/><path d="M500 26C560 22 612 28 638 40" stroke="${e}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M520 92C580 96 616 90 636 80" stroke="${e}" stroke-width="4" fill="none" stroke-linecap="round"/></g>`}</svg>`}function ef({fill:e=`#ffc7d6`,edge:t=`#f08aa6`}={}){return Jd(40,40,`<defs><linearGradient id="p" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff5f8"/><stop offset="1" stop-color="${e}"/></linearGradient></defs><path d="M20 38C8 30 4 16 11 6L20 11L29 6C36 16 32 30 20 38Z" fill="url(#p)" stroke="${t}" stroke-width="1.2"/><path d="M20 36L20 16" stroke="${t}" stroke-width="0.8" opacity=".6"/>`)}function tf({a:e=`#a8dc62`,b:t=`#3f8a2e`,line:n=`#1f4a18`}={}){return Jd(100,120,`<defs><linearGradient id="l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${e}"/><stop offset="1" stop-color="${t}"/></linearGradient></defs><path d="M50 104L50 116" stroke="${n}" stroke-width="6" stroke-linecap="round"/><path d="M50 6C80 22 94 56 70 88C63 97 55 102 50 106C45 102 37 97 30 88C6 56 20 22 50 6Z" fill="url(#l)" stroke="${n}" stroke-width="4.5" stroke-linejoin="round"/><path d="M50 14L50 104" stroke="${n}" stroke-width="3.2" stroke-linecap="round"/><g stroke="${n}" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".85"><path d="M50 34L66 24"/><path d="M50 52L74 40"/><path d="M50 70L72 60"/><path d="M50 88L64 80"/><path d="M50 34L34 24"/><path d="M50 52L26 40"/><path d="M50 70L28 60"/><path d="M50 88L36 80"/></g><path d="M40 22C34 30 30 40 30 50" stroke="#fff" stroke-width="3.5" stroke-linecap="round" fill="none" opacity=".45"/>`)}function nf({disc:e=Wd.shu,fg:t=Wd.washi,ring:n=Wd.gold}={}){return Jd(100,100,`<circle cx="50" cy="50" r="47" fill="${n}"/><circle cx="50" cy="50" r="42.5" fill="${e}"/><g transform="translate(50 50) rotate(-28) translate(-50 -56) scale(1 .96)"><path d="M50 16C74 28 84 54 66 78C60 86 54 90 50 93C46 90 40 86 34 78C16 54 26 28 50 16Z" fill="${t}"/><path d="M50 22L50 99" stroke="${e}" stroke-width="3.4" stroke-linecap="round"/><g stroke="${e}" stroke-width="2.6" stroke-linecap="round"><path d="M50 40L63 31"/><path d="M50 55L68 45"/><path d="M50 70L64 62"/><path d="M50 40L37 31"/><path d="M50 55L32 45"/><path d="M50 70L36 62"/></g></g>`)}function rf({fill:e=Wd.shu,R:t=46}={}){let n=t*.4,r=t*.31,i=e=>e*e*(3-2*e),a=(e,t)=>{let n=(t-90)*Math.PI/180;return[50+e*Math.cos(n),50+e*Math.sin(n)]},o=e=>{let o=[];for(let s=0;s<=36;s++){let c=s/36*165,l=n+r+(t-(n+r))*i(Math.min(1,c/75));o.push(a(l,e+c))}for(let r=36;r>=0;r--){let i=r/36*165,s=n+(t-n)*(i/165)**.85;o.push(a(s,e+i))}let s=a(n,e);return`<path d="${o.map((e,t)=>`${t?`L`:`M`}${X(e[0])} ${X(e[1])}`).join(``)+`Z`}"/><circle cx="${X(s[0])}" cy="${X(s[1])}" r="${X(r)}"/>`};return Jd(100,100,`<g fill="${e}">${o(0)}${o(120)}${o(240)}</g>`)}function af(){let e=`M68 86L68 46C68 30 58 20 46 20C34 20 26 30 26 44L26 56`;return Jd(100,100,`<path d="${e}" fill="none" stroke="${Gd}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 50L44 50L26 80Z" fill="${Gd}" stroke="${Gd}" stroke-width="10" stroke-linejoin="round"/><path d="${e}" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 53L39 53L26 74Z" fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`)}function of({c:e=Wd.washi}={}){return Jd(100,100,`<g fill="none" stroke="${e}" stroke-width="8" stroke-linecap="round"><circle cx="50" cy="56" r="34"/><path d="M50 56L50 36"/><path d="M50 56L64 64"/><path d="M40 10L60 10"/><path d="M50 10L50 22"/><path d="M80 24L86 18"/></g>`)}function sf(e){let t=[[`#ffd1dd`,`#ef7f9e`],[`#fffdf5`,`#e3d4b2`],[`#cbe89c`,`#6fa446`]],n=e=>[14+72*e,90-78*e],r=[.3,.545,.79],i=[2,1,0],a=`<defs>`;t.forEach((e,t)=>{a+=`<radialGradient id="d${t}" cx=".36" cy=".32" r=".78"><stop offset="0" stop-color="${e[0]}"/><stop offset=".62" stop-color="${e[0]}"/><stop offset="1" stop-color="${e[1]}"/></radialGradient>`}),a+=`</defs>`;let o=a;o+=`<path d="M14 90L86 12" stroke="${Gd}" stroke-width="10" stroke-linecap="round"/>`,o+=`<path d="M14 90L86 12" stroke="#dcaa62" stroke-width="4.6" stroke-linecap="round"/>`;for(let t=0;t<e;t++){let[e,a]=n(r[t]),s=i[t];o+=`<circle cx="${X(e)}" cy="${X(a)}" r="16" fill="url(#d${s})" stroke="${Gd}" stroke-width="4"/>`,o+=`<ellipse cx="${X(e-5.5)}" cy="${X(a-6)}" rx="5" ry="3.2" fill="#fff" opacity=".8" transform="rotate(-40 ${X(e-5.5)} ${X(a-6)})"/>`}return Jd(100,100,o)}function cf(){return Jd(100,100,`<defs><radialGradient id="r" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#ff8a62"/><stop offset=".55" stop-color="${Wd.shu}"/><stop offset="1" stop-color="#8e1f0c"/></radialGradient></defs><path d="M50 7C77 7 91 28 91 54C91 80 75 94 50 94C25 94 9 80 9 54C9 28 23 7 50 7Z" fill="url(#r)" stroke="${Gd}" stroke-width="4"/><path d="M50 23C67 23 75 35 75 48C75 62 65 69 50 69C35 69 25 62 25 48C25 35 33 23 50 23Z" fill="#fdf3e1" stroke="${Gd}" stroke-width="3"/><g stroke="${Gd}" stroke-linecap="round" fill="none"><path d="M30 37Q38 28 46 36" stroke-width="4.5"/><path d="M54 36Q62 28 70 37" stroke-width="4.5"/><path d="M39 58Q44 62 50 59Q56 62 61 58" stroke-width="3"/></g><circle cx="39" cy="46" r="6.2" fill="#fff" stroke="${Gd}" stroke-width="2.5"/><circle cx="39.5" cy="46.5" r="3.4" fill="${Gd}"/><circle cx="61" cy="46" r="6.2" fill="#fff" stroke="${Gd}" stroke-width="2.5"/><circle cx="60.5" cy="46.5" r="3.4" fill="${Gd}"/><g stroke="#f6cd62" stroke-linecap="round" fill="none"><path d="M28 80Q50 71 72 80" stroke-width="4.2"/><path d="M35 87Q50 82 65 87" stroke-width="3.2"/></g><ellipse cx="28" cy="27" rx="8" ry="4.5" fill="#fff" opacity=".5" transform="rotate(-38 28 27)"/>`)}function lf(){let e=(e,t)=>{let n=(t+18)*Math.PI/180;return`${X(50+e*Math.cos(n))} ${X(50+e*Math.sin(n))}`},t=``,n=``,r=``;for(let i=0;i<4;i++){let a=i*90;t+=`<path d="M50 50L${e(12,a-45)}L${e(46,a)}Z"/>`,n+=`<path d="M50 50L${e(46,a)}L${e(12,a+45)}Z"/>`,r+=`${i?`L`:`M`}${e(46,a)}L${e(12,a+45)}`}return Jd(100,100,`<path d="${r}Z" fill="none" stroke="#1b1f26" stroke-width="7" stroke-linejoin="round"/><g fill="#eef2f6">${t}</g><g fill="#7d8896">${n}</g><path d="${r}Z" fill="none" stroke="#1b1f26" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="50" r="8.5" fill="#39414d" stroke="#1b1f26" stroke-width="3"/><circle cx="50" cy="50" r="3.6" fill="#141820"/>`)}function uf(){let e=(e,t,n,r)=>{let i=(i,a)=>{let o=r*Math.PI/180;return[e+(i*Math.cos(o)-a*Math.sin(o))*n,t+(i*Math.sin(o)+a*Math.cos(o))*n]},a=i(0,0),o=(e,t,r)=>{let o=i(e,t),s=o[0]-a[0],c=o[1]-a[1],l=Math.hypot(s,c)||1,u=-c/l*r*n,d=s/l*r*n,f=`${X(a[0]+u)} ${X(a[1]+d)}`,p=`${X(a[0]-u)} ${X(a[1]-d)}`,m=`${X(o[0])} ${X(o[1])}`;return`<path d="M${f}L${m}L${p}Z" fill="#3a3f49" stroke="${Gd}" stroke-width="${X(3.2*Math.max(.7,n))}" stroke-linejoin="round"/><path d="M${f}L${m}L${X(a[0])} ${X(a[1])}Z" fill="#9aa3b0"/>`};return`<ellipse cx="${X(a[0])}" cy="${X(t+30*n)}" rx="${X(30*n)}" ry="${X(5*n)}" fill="${Gd}" opacity=".22"/>`+o(-26,-30,8)+o(30,-18,8)+o(0,-44,8.5)+o(-30,22,8)+o(28,26,8)+`<circle cx="${X(a[0])}" cy="${X(a[1])}" r="${X(9*n)}" fill="#59606c" stroke="${Gd}" stroke-width="${X(3.2*Math.max(.7,n))}"/><circle cx="${X(a[0]-3*n)}" cy="${X(a[1]-3*n)}" r="${X(3.2*n)}" fill="#c3cad4"/>`};return Jd(100,100,e(76,30,.56,20)+e(19,70,.46,-15)+e(50,58,.98,0))}function df(){return Jd(100,100,`<defs><clipPath id="h"><circle cx="52" cy="40" r="23"/></clipPath></defs><path d="M28 58C22 76 26 94 52 94C78 94 82 76 76 58Z" fill="#fffaf1" stroke="${Gd}" stroke-width="3.5" stroke-linejoin="round"/><ellipse cx="52" cy="80" rx="8.5" ry="10.5" fill="#f3c55a" stroke="${Gd}" stroke-width="2.5"/><path d="M47.5 76L56.5 76M47 80L57 80M47.5 84L56.5 84" stroke="#b5821f" stroke-width="1.4"/><path d="M30 62C20 54 17 42 20 30" stroke="${Gd}" stroke-width="14" stroke-linecap="round" fill="none"/><path d="M30 62C20 54 17 42 20 30" stroke="#fffaf1" stroke-width="7.5" stroke-linecap="round" fill="none"/><circle cx="20" cy="25" r="8.5" fill="#fffaf1" stroke="${Gd}" stroke-width="3.2"/><path d="M16 22L16 26M20 20L20 25M24 22L24 26" stroke="#f08aa6" stroke-width="1.8" stroke-linecap="round"/><path d="M33 30L33 9L49 21Z" fill="#fffaf1" stroke="${Gd}" stroke-width="3.2" stroke-linejoin="round"/><path d="M71 30L71 9L55 21Z" fill="#f29a3a" stroke="${Gd}" stroke-width="3.2" stroke-linejoin="round"/><path d="M36 25L36 15L44 21Z" fill="#f7a8bb"/><circle cx="52" cy="40" r="23" fill="#fffaf1"/><g clip-path="url(#h)"><path d="M56 14C72 14 80 26 78 36C68 35 60 28 56 14Z" fill="#f29a3a"/><path d="M28 30C34 26 40 26 42 18C34 16 28 22 28 30Z" fill="#3b3330"/></g><circle cx="52" cy="40" r="23" fill="none" stroke="${Gd}" stroke-width="3.5"/><g stroke="${Gd}" stroke-linecap="round" fill="none"><path d="M40 40Q44 35 48 40" stroke-width="3"/><path d="M56 40Q60 35 64 40" stroke-width="3"/><path d="M47 50Q49.5 53 52 50Q54.5 53 57 50" stroke-width="2"/><path d="M33 45L42 46M33 50L42 49M62 46L71 45M62 49L71 50" stroke-width="1.6"/></g><path d="M50 45.5L54 45.5L52 48Z" fill="#f07a9a" stroke="#f07a9a" stroke-width="1" stroke-linejoin="round"/><path d="M32 60Q52 70 72 60" stroke="${Gd}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M32 60Q52 70 72 60" stroke="${Wd.shu}" stroke-width="5.5" fill="none" stroke-linecap="round"/><circle cx="52" cy="67" r="5.5" fill="#f6cd62" stroke="${Gd}" stroke-width="2.5"/><path d="M49 67L55 67" stroke="${Gd}" stroke-width="1.5"/>`)}function ff(){return Jd(100,100,`<defs><linearGradient id="m" x1="0" x2="1"><stop offset="0" stop-color="#8a6118"/><stop offset=".22" stop-color="#fbe7a4"/><stop offset=".5" stop-color="#d9a93a"/><stop offset=".78" stop-color="#fdf0bf"/><stop offset="1" stop-color="#8a6118"/></linearGradient><linearGradient id="i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e4c12"/><stop offset="1" stop-color="#d1a445"/></linearGradient></defs><g stroke="${Gd}" stroke-width="3.2" stroke-linecap="round"><path d="M14 16L22 26"/><path d="M50 6L50 18"/><path d="M86 16L78 26"/></g><path d="M9 44L21 80C23 87 30 90 50 90C70 90 77 87 79 80L91 44Z" fill="url(#m)" stroke="${Gd}" stroke-width="4" stroke-linejoin="round"/><path d="M19 60Q50 71 81 60" stroke="#fff6cf" stroke-width="2.4" fill="none" opacity=".8"/><path d="M22 72Q50 81 78 72" stroke="#7a5512" stroke-width="2" fill="none" opacity=".55"/><ellipse cx="50" cy="44" rx="42" ry="13" fill="url(#m)" stroke="${Gd}" stroke-width="4"/><ellipse cx="50" cy="44.5" rx="34.5" ry="8.6" fill="url(#i)"/><ellipse cx="38" cy="42" rx="10" ry="2.4" fill="#fff" opacity=".35"/>`)}function pf(){let e=``;for(let t=18;t<=82;t+=5.2)e+=`<path d="M20 ${X(t)}L80 ${X(t)}"/>`;return Jd(100,100,`<defs><radialGradient id="g" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#f6cc4e"/><stop offset="1" stop-color="#b87916"/></radialGradient><clipPath id="c"><ellipse cx="50" cy="50" rx="24" ry="37"/></clipPath></defs><g transform="rotate(-16 50 50)"><ellipse cx="50" cy="50" rx="31" ry="45" fill="url(#g)" stroke="${Gd}" stroke-width="4"/><ellipse cx="50" cy="50" rx="24.5" ry="37.5" fill="none" stroke="#a4700f" stroke-width="2"/><g clip-path="url(#c)" stroke="#c9922a" stroke-width="1.6" opacity=".75">${e}</g><rect x="42" y="32" width="16" height="22" rx="3" fill="#e8b23e" stroke="#8a5a0c" stroke-width="2"/><path d="M46 37L54 37M46 42L54 42M46 47L54 47" stroke="#6e460a" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="22" r="4" fill="none" stroke="#8a5a0c" stroke-width="2"/><circle cx="50" cy="78" r="4" fill="none" stroke="#8a5a0c" stroke-width="2"/><ellipse cx="38" cy="28" rx="7" ry="11" fill="#fff" opacity=".4" transform="rotate(20 38 28)"/></g>`)}var mf={dango3:()=>sf(3),dango2:()=>sf(2),dango1:()=>sf(1),daruma:cf,shuriken:lf,makibishi:uf,manekineko:df,kanedarai:ff,koban:pf};Object.keys(mf);var hf=new Map;function gf(e){return mf[e]?(hf.has(e)||hf.set(e,Kd(mf[e]())),hf.get(e)):null}function _f(e,t,n,r,i){let a=``;for(let o=0;o<5;o++)a+=`<path transform="translate(${e} ${t}) rotate(${o*72}) scale(${n})" d="M0 0C-15 -8 -17 -29 -6.5 -38L0 -32.5L6.5 -38C17 -29 15 -8 0 0Z" fill="${r}" stroke="${i}" stroke-width="${X(2/n)}" stroke-linejoin="round"/>`;return a+=`<circle cx="${e}" cy="${t}" r="${X(5*n)}" fill="#f6cd62" stroke="${i}" stroke-width="1.2"/>`,a}function vf(e,t=[`#e0b04a`,`#d8401f`]){let n=`<circle cx="50" cy="50" r="46" fill="none" stroke="${Gd}" stroke-width="4"/><circle cx="50" cy="50" r="41" fill="none" stroke="#fff" stroke-width="1.5" opacity=".55"/>`,r=`<clipPath id="c"><circle cx="50" cy="50" r="46"/></clipPath>`;if(e===`inaka`)return Jd(100,100,`<defs>${r}<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd36e"/><stop offset=".55" stop-color="#ff8f45"/><stop offset="1" stop-color="#e0582c"/></linearGradient></defs><g clip-path="url(#c)"><rect width="100" height="100" fill="url(#s)"/><circle cx="42" cy="60" r="17" fill="#fff0c2"/><circle cx="42" cy="60" r="23" fill="#fff0c2" opacity=".25"/><path d="M0 62Q18 50 36 58T72 55T100 58V100H0Z" fill="#9b4a33" opacity=".75"/><path d="M0 68L100 64V100H0Z" fill="#6f8a2a"/><g stroke="#e8c85a" stroke-width="2.6" opacity=".9"><path d="M0 75L100 71"/><path d="M0 84L100 80"/><path d="M0 94L100 90"/></g><g stroke="#4f6a1c" stroke-width="1.6"><path d="M20 66L20 100"/><path d="M50 65L50 100"/><path d="M80 64L80 100"/></g><g transform="translate(70 30) rotate(-18)" fill="#8f2412"><path d="M-14 0L16 0" stroke="#8f2412" stroke-width="3.2" stroke-linecap="round"/><ellipse cx="-3" cy="-6" rx="3" ry="9" transform="rotate(-18 -3 -6)" opacity=".75"/><ellipse cx="3" cy="-6" rx="3" ry="9" transform="rotate(18 3 -6)" opacity=".75"/><ellipse cx="-3" cy="6" rx="3" ry="9" transform="rotate(18 -3 6)" opacity=".75"/><ellipse cx="3" cy="6" rx="3" ry="9" transform="rotate(-18 3 6)" opacity=".75"/><circle cx="-15" cy="0" r="3"/></g></g>`+n);if(e===`sakura`)return Jd(100,100,`<defs>${r}<radialGradient id="s" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#fff4f7"/><stop offset=".6" stop-color="#ffc4d3"/><stop offset="1" stop-color="#e9869f"/></radialGradient></defs><g clip-path="url(#c)"><rect width="100" height="100" fill="url(#s)"/><g fill="${Wd.shu}" stroke="${Gd}" stroke-width="2"><path d="M18 86L82 86L80 81L20 81Z"/><rect x="28" y="86" width="5" height="20"/><rect x="67" y="86" width="5" height="20"/><rect x="22" y="92" width="56" height="4"/></g>`+_f(50,46,.95,`#fff6f9`,`#d9738e`)+_f(20,24,.35,`#ffe0e8`,`#d9738e`)+_f(82,30,.3,`#ffe0e8`,`#d9738e`)+`</g>`+n);if(e===`matsuri`){let e=``;for(let t=0;t<16;t++){let n=t/16*Math.PI*2;e+=`<path d="M${X(66+Math.cos(n)*7)} ${X(28+Math.sin(n)*7)}L${X(66+Math.cos(n)*20)} ${X(28+Math.sin(n)*20)}"/>`}return Jd(100,100,`<defs>${r}<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2552"/><stop offset="1" stop-color="#3b2a6b"/></linearGradient><radialGradient id="l" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#ffb07a"/><stop offset=".5" stop-color="#e8431f"/><stop offset="1" stop-color="#8e1f0c"/></radialGradient></defs><g clip-path="url(#c)"><rect width="100" height="100" fill="url(#s)"/><g stroke="#ffd36e" stroke-width="2.4" stroke-linecap="round">${e}</g><circle cx="66" cy="28" r="3" fill="#fff3c4"/><g stroke="#ff8fb0" stroke-width="1.8" stroke-linecap="round" opacity=".8"><path d="M22 20L22 26M19 23L25 23"/><path d="M86 58L86 62M84 60L88 60"/></g><path d="M40 30L40 38" stroke="${Gd}" stroke-width="3"/><rect x="31" y="36" width="18" height="6" rx="2" fill="#2b2624" stroke="${Gd}" stroke-width="2"/><ellipse cx="40" cy="62" rx="21" ry="23" fill="url(#l)" stroke="${Gd}" stroke-width="3"/><g stroke="#7a1a0a" stroke-width="1.6" fill="none" opacity=".8"><path d="M20 55Q40 50 60 55"/><path d="M19.5 62Q40 57 60.5 62"/><path d="M20 69Q40 64 60 69"/></g><rect x="31" y="82" width="18" height="6" rx="2" fill="#2b2624" stroke="${Gd}" stroke-width="2"/><path d="M40 88L40 96" stroke="#f6cd62" stroke-width="3"/><ellipse cx="33" cy="52" rx="5" ry="8" fill="#fff" opacity=".35"/></g>`+n)}let[i,a]=t;return Jd(100,100,`<defs>${r}<linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${i}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs><g clip-path="url(#c)"><rect width="100" height="100" fill="url(#s)"/></g>`+n)}var yf=class{constructor(e){this.canvas=e,this.ctx=e.getContext(`2d`),this.bg=document.createElement(`canvas`),this.path=null,this._dirty=!0,this._cssW=0,this._cssH=0,this._dpr=1,this._tf={s:1,ox:0,oy:0},this._onResize=()=>{this._dirty=!0},window.addEventListener(`resize`,this._onResize)}setPath(e){this.path=Array.isArray(e)&&e.length>2?bf(e,900):null,this._dirty=!0,this._layout()}_layout(){let e=this.canvas.clientWidth,t=this.canvas.clientHeight;if(!e||!t)return!1;let n=Math.min(2,window.devicePixelRatio||1);this._cssW=e,this._cssH=t,this._dpr=n;let r=Math.round(e*n),i=Math.round(t*n);(this.canvas.width!==r||this.canvas.height!==i)&&(this.canvas.width=r,this.canvas.height=i),this.bg.width=r,this.bg.height=i,this._dirty=!1;let a=this.bg.getContext(`2d`);a.clearRect(0,0,r,i);let o=this.path;if(!o)return!0;let s=1/0,c=-1/0,l=1/0,u=-1/0;for(let[e,t]of o)e<s&&(s=e),e>c&&(c=e),t<l&&(l=t),t>u&&(u=t);let d=r/190,f=6.5*d,p=f*1.6+4*d,m=Math.min((r-2*p)/Math.max(.001,c-s),(i-2*p)/Math.max(.001,u-l)),h=(r-(c-s)*m)/2-s*m,g=(i-(u-l)*m)/2-l*m;this._tf={s:m,ox:h,oy:g,unit:d};let _=()=>{a.beginPath();for(let e=0;e<o.length;e++){let t=o[e][0]*m+h,n=o[e][1]*m+g;e?a.lineTo(t,n):a.moveTo(t,n)}a.closePath()};a.lineJoin=`round`,a.lineCap=`round`,a.save(),a.shadowColor=`rgba(10,8,8,0.55)`,a.shadowBlur=6*d,a.shadowOffsetY=2*d,_(),a.strokeStyle=`rgba(29,26,25,0.92)`,a.lineWidth=f+6.5*d,a.stroke(),a.restore(),_(),a.strokeStyle=`#fffaf0`,a.lineWidth=f+3*d,a.stroke(),_(),a.strokeStyle=`#57504c`,a.lineWidth=f,a.stroke(),a.save(),a.setLineDash([2.2*d,4.2*d]),_(),a.strokeStyle=`rgba(247,241,227,0.35)`,a.lineWidth=.9*d,a.stroke(),a.restore();let v=1;for(;v<o.length-1&&Math.hypot(o[v][0]-o[0][0],o[v][1]-o[0][1])<.001;)v++;let y=Math.atan2(o[v][1]-o[0][1],o[v][0]-o[0][0]),b=f+3*d,x=f*.62;a.save(),a.translate(o[0][0]*m+h,o[0][1]*m+g),a.rotate(y),a.fillStyle=`#1d1a19`,a.fillRect(-x/2-d,-b/2-d,x+2*d,b+2*d);for(let e=0;e<2;e++)for(let t=0;t<4;t++)a.fillStyle=(e+t)%2?`#1d1a19`:`#fffaf0`,a.fillRect(-x/2+e*x/2,-b/2+t*b/4,x/2+.5,b/4+.5);return a.restore(),!0}draw(e){if(this._dirty&&!this._layout())return;let t=this.ctx,n=this.canvas.width,r=this.canvas.height;if(t.clearRect(0,0,n,r),!this.path||(t.drawImage(this.bg,0,0),!e||!e.length))return;let{s:i,ox:a,oy:o,unit:s}=this._tf,c=null;t.lineWidth=1.8*s,t.strokeStyle=`#1d1a19`;for(let n of e){if(n.isPlayer){c=n;continue}t.beginPath(),t.arc(n.x*i+a,n.z*i+o,4.6*s,0,Math.PI*2),t.fillStyle=n.color||`#e0b04a`,t.fill(),t.stroke()}if(c){let e=c.x*i+a,n=c.z*i+o,r=performance.now()%1200/1200;t.beginPath(),t.arc(e,n,(7+9*r)*s,0,Math.PI*2),t.strokeStyle=`rgba(255,250,240,${(.7*(1-r)).toFixed(3)})`,t.lineWidth=2*s,t.stroke(),t.beginPath(),t.arc(e,n,8.2*s,0,Math.PI*2),t.fillStyle=`#1d1a19`,t.fill(),t.beginPath(),t.arc(e,n,6.8*s,0,Math.PI*2),t.fillStyle=`#fffaf0`,t.fill(),t.beginPath(),t.arc(e,n,4.6*s,0,Math.PI*2),t.fillStyle=c.color||`#d8401f`,t.fill()}}dispose(){window.removeEventListener(`resize`,this._onResize)}};function bf(e,t){let n=e.map(e=>Array.isArray(e)?[e[0],e[1]]:[e.x,e.z??e.y]);if(n.length<=t)return n;let r=[],i=n.length/t;for(let e=0;e<t;e++)r.push(n[Math.floor(e*i)]);return r}var xf={ArrowUp:`up`,KeyW:`up`,ArrowDown:`down`,KeyS:`down`,ArrowLeft:`left`,KeyA:`left`,ArrowRight:`right`,KeyD:`right`,Enter:`ok`,NumpadEnter:`ok`,Space:`ok`,Escape:`back`,Backspace:`back`},Sf=[[`speed`,`スピード`],[`accel`,`かそく`],[`handling`,`ハンドリング`],[`weight`,`おもさ`]],Cf=[{id:`50cc`,label:`ゆったり`,lv:1},{id:`100cc`,label:`ふつう`,lv:2},{id:`150cc`,label:`はやい`,lv:3}],wf={tanuki:`狸`,kitsune:`狐`,neko:`猫`,shiba:`犬`,usagi:`兎`,kappa:`河`,tengu:`天`,oni:`鬼`},Tf=[`壱`,`弐`,`参`,`肆`,`伍`,`陸`],Ef=[`dango3`,`daruma`,`shuriken`,`makibishi`,`manekineko`,`kanedarai`,`koban`],Df=[[`↑ / W`,`アクセル`],[`↓ / S`,`ブレーキ`],[`← → / A D`,`ハンドル`],[`Space / Shift`,`ジャンプ・ドリフト`],[`E / X`,`アイテム`],[`Esc`,`ポーズ`]],Of=[`ドリフトを長くつづけると、火花の色が 青 → オレンジ → むらさき に変わるよ！`,`ジャンプ台で飛んだ瞬間にジャンプボタンを押すと、トリックが決まって加速！`,`小判を集めると最高速が少しアップ。最大10枚まで持てるよ。`,`和傘グライダーで空をすべろう。ゆっくり降りればショートカットも…？`,`ダッシュ板を踏むと一気に加速！コースの矢印をよく見よう。`,`金だらいは上から降ってくる！ 音がしたら気をつけて。`,`だるまはライバルを追いかけて転がっていくよ。`,`アイテムを持ったまま ↓ を押しながら使うと、うしろに投げられる。`];function kf(e){if(e==null||!Number.isFinite(e))return`--`;let t=Math.floor(Math.max(0,e)*100+1e-7),n=Math.floor(t/6e3),r=Math.floor(t/100)%60,i=t%100;return`${n}'${String(r).padStart(2,`0`)}"${String(i).padStart(2,`0`)}`}function Z(e,t,n){let r=document.createElement(e);return t&&(r.className=t),n!=null&&(r.textContent=n),r}function Af(e,t=``){let n=Z(`span`,`pk-ot ${t}`);return n.dataset.text=e,n.appendChild(Z(`span`,null,e)),n}function jf(e,t){t=String(t),e.dataset.text!==t&&(e.dataset.text=t,e.firstChild.textContent=t)}function Mf(e){return e==null||e===``?null:typeof e==`number`?`#${(e>>>0).toString(16).padStart(6,`0`).slice(-6)}`:typeof e==`object`&&typeof e.getHexString==`function`?`#${e.getHexString()}`:String(e)}function Nf(e){let t=/^#([0-9a-f]{6})$/i.exec(e||``);if(!t)return .5;let n=parseInt(t[1],16),r=e=>(e/=255,e<=.04?e/12.9:((e+.055)/1.055)**2.4);return .2126*r(n>>16&255)+.7152*r(n>>8&255)+.0722*r(n&255)}function Pf(e){let t=Mf(e&&e.color);if(t)return t;let n=e&&e.colors||{},r=[n.body,n.accent,n.fur].map(Mf).filter(Boolean);for(let e of r)if(Nf(e)>.06)return e;return r[0]||`#d8401f`}function Ff(e){if(e.type)return e.type;let t=e.stats||{},n={speed:t.speed||0,accel:t.accel||0,handling:t.handling||0,weight:t.weight||0},r=Object.values(n),i=Math.max(...r);return i-Math.min(...r)<=1?`バランス型`:n.handling===i?`テクニック型`:n.speed===i?`スピード型`:n.accel===i?`ダッシュ型`:`パワー型`}var If=()=>Math.min(window.innerWidth/1280,window.innerHeight/720),Lf=null;function Rf(){return Lf||(Lf={"--pat-seigaiha-ai":qd(Yd({r:24,bg:`#1f3363`,fg:`#2d4883`,sw:1.7})),"--pat-seigaiha-sumi":qd(Yd({r:24,bg:`#1d1a19`,fg:`#2d2826`,sw:1.7})),"--pat-seigaiha-shu":qd(Yd({r:24,bg:`#c93a1b`,fg:`#df5530`,sw:1.7})),"--pat-seigaiha-washi":qd(Yd({r:24,bg:`#f5eedd`,fg:`#e9dec4`,sw:1.7})),"--pat-asanoha-gold":qd(Xd({s:36,stroke:`rgba(224,176,74,0.62)`,sw:1.3})),"--pat-asanoha-white":qd(Xd({s:36,stroke:`rgba(255,255,255,0.32)`,sw:1.4})),"--pat-asanoha-ink":qd(Xd({s:36,stroke:`rgba(29,26,25,0.085)`,sw:1.3})),"--pat-yagasuri":qd(Zd({a:`#243a6b`,b:`#f3ead6`})),"--pat-paper":qd(Qd()),"--img-brush-shu":qd($d({color:`#d8401f`})),"--img-brush-sumi":qd($d({color:`#1d1a19`,seed:9})),"--img-brush-ai":qd($d({color:`#243a6b`,seed:5})),"--img-leaf":qd(tf()),"--img-crest":qd(nf()),"--img-tomoe":qd(rf()),"--img-uturn":qd(af()),"--img-petal":qd(ef()),"--img-watch":qd(of())},Lf)}var zf=/[0-9\u2007]/,Bf=class{constructor(e){this.el=e,this.cells=[],this.str=null}set(e){if(e!==this.str){if(this.str==null||e.length!==this.str.length)this.el.textContent=``,this.cells=[...e].map(e=>{let t=Z(`span`,zf.test(e)?`pk-dg`:`pk-dg pk-dg--sep`,e);return this.el.appendChild(t),t});else for(let t=0;t<e.length;t++)e[t]!==this.str[t]&&(this.cells[t].textContent=e[t],this.cells[t].className=zf.test(e[t])?`pk-dg`:`pk-dg pk-dg--sep`);this.str=e}}},Vf=class{constructor(e=document.body){this.onSound=null,this.speedGaugeMax=160,this._assets={itemIcons:{},portraits:{}},this._charInfo=new Map,this._timers=new Set,this._screen=null,this._screenAt=0,this._locked=!1,this._mouseArmed=!1,this._loadingOn=!1;let t=this.el=Z(`div`,`pk-ui`);t.lang=`ja`,e!==document.body&&e!==document.documentElement&&t.classList.add(`pk-ui--contained`);for(let[e,n]of Object.entries(Rf()))t.style.setProperty(e,n);this._buildHUD(),this._fx=Z(`div`,`pk-layer pk-fx`),this._menu=Z(`div`,`pk-layer pk-menu`),t.append(this._hud.root,this._fx,this._menu),this._buildWrongWay(),this._buildFade(),this._buildLoading(),e.appendChild(t),this._onKeyDown=e=>this._handleKey(e),this._onPointerMove=e=>{(e.movementX||e.movementY)&&(this._mouseArmed=!0)},window.addEventListener(`keydown`,this._onKeyDown,!0),window.addEventListener(`pointermove`,this._onPointerMove,!0)}setAssets({itemIcons:e,portraits:t}={}){e&&(this._assets.itemIcons={...this._assets.itemIcons,...e}),t&&(this._assets.portraits={...this._assets.portraits,...t}),this.el.querySelectorAll(`[data-portrait]`).forEach(e=>this._fillPortrait(e,e.dataset.portrait)),this._hud.coinIcon.src=this._itemSrc(`koban`),this._hud.shownItem&&!this._roulette&&(this._hud.img.src=this._itemSrc(this._hud.shownItem))}_itemSrc(e){return this._assets.itemIcons&&this._assets.itemIcons[e]||gf(e)||gf(`koban`)}_sfx(e){if(typeof this.onSound==`function`)try{this.onSound(e)}catch(e){console.error(e)}}_later(e,t){let n=setTimeout(()=>{this._timers.delete(n),e()},t);return this._timers.add(n),n}_rememberChars(e){for(let t of e||[])this._charInfo.set(t.id,{kanji:t.kanji||wf[t.id]||(t.name||`？`)[0],color:Pf(t),name:t.name})}_portrait(e,t=``,n=null){let r=Z(`div`,`pk-portrait ${t}`);return r.dataset.portrait=e,n&&(r.dataset.color=n),this._fillPortrait(r,e),r}_fillPortrait(e,t){e.textContent=``;let n=this._assets.portraits&&this._assets.portraits[t],r=this._charInfo.get(t),i=r&&r.color||e.dataset.color||`#8f7760`;if(e.style.setProperty(`--pc`,i),n){e.classList.remove(`is-ph`);let t=new Image;t.alt=``,t.draggable=!1,t.src=n,e.appendChild(t)}else{e.classList.add(`is-ph`);let n=Z(`div`,`pk-portrait__ph`);n.appendChild(Z(`span`,`pk-portrait__k`,r&&r.kanji||wf[t]||`？`)),e.appendChild(n)}}_handleKey(e){if(!this._screen||e.altKey||e.ctrlKey||e.metaKey)return;let t=xf[e.code];t&&(e.preventDefault(),e.stopPropagation(),!(e.timeStamp&&e.timeStamp<this._screenAt)&&(!e.repeat||t!==`ok`&&t!==`back`)&&this.nav(t))}nav(e){let t=this._screen;!t||this._locked||this._loadingOn||this._fade.closed||t.nav&&t.nav(e)}getPreviewRect(){let e=this._screen,t=e&&e.root.querySelector(`.pk-preview-slot`);if(!t)return null;let n=t.getBoundingClientRect();return{x:n.left,y:n.top,width:n.width,height:n.height,cx:n.left+n.width/2,cy:n.top+n.height/2}}_open(e,t,n={}){return this._closeScreen(),t.classList.add(`pk-scr--${e}`),(this._fade.closed||this._loadingOn)&&t.classList.add(`is-held`),this._menu.appendChild(t),this._screen={name:e,root:t,...n},this._screenAt=performance.now(),this._locked=!1,this._mouseArmed=!1,this._screen}_closeScreen(){let e=this._screen;if(!e)return;this._screen=null,this._locked=!1;try{e.destroy&&e.destroy()}catch(e){console.error(e)}let t=e.root;t.style.pointerEvents=`none`;let n=t.animate([{opacity:1},{opacity:0}],{duration:170,easing:`ease-in`,fill:`forwards`});n.onfinish=()=>t.remove(),this._later(()=>t.remove(),450)}_releaseHeld(){this._menu.querySelectorAll(`.pk-scr.is-held`).forEach(e=>e.classList.remove(`is-held`))}hideMenus(){this._closeScreen()}_pick(e,t=240){this._locked=!0,this._sfx(`menu_ok`),this._later(()=>{typeof e==`function`&&e()},t)}_goBack(e){typeof e==`function`&&(this._locked=!0,this._sfx(`menu_back`),this._later(e,90))}_topbar(e,t,n=null,r=null){let i=Z(`div`,`pk-topbar`),a=Z(`div`,`pk-head`);if(a.appendChild(Z(`div`,`pk-head__brush`)),a.appendChild(Z(`div`,`pk-head__sub`,t)),a.appendChild(Af(e,`pk-d pk-head__title`)),i.appendChild(a),n!=null){let e=Z(`div`,`pk-steps`);[`キャラ`,`コース`,`レース`].forEach((t,r)=>{r&&e.appendChild(Z(`i`,`pk-steps__line`+(r<=n?` is-done`:``)));let i=Z(`div`,`pk-step`+(r<n?` is-done`:r===n?` is-active`:``));i.appendChild(Z(`span`,`pk-step__n`,String(r+1))),i.appendChild(Z(`span`,`pk-step__l`,t)),e.appendChild(i)}),i.appendChild(e)}if(r){let e=Z(`div`,`pk-topchip`);e.appendChild(Z(`span`,`pk-topchip__label`,`コース`)),e.appendChild(Z(`span`,`pk-topchip__text`,r)),i.appendChild(e)}return i}_footer(e,{ok:t,back:n,backLabel:r=`もどる`}={}){let i=Z(`div`,`pk-foot`),a=Z(`div`,`pk-foot__left`);if(n){let e=Z(`div`,`pk-backbtn`);e.setAttribute(`role`,`button`),e.appendChild(Z(`span`,`pk-backbtn__arrow`)),e.appendChild(Z(`span`,null,r)),e.appendChild(Z(`span`,`pk-key pk-key--dark`,`Esc`)),e.addEventListener(`click`,e=>{e.stopPropagation(),this._locked||n()}),a.appendChild(e)}let o=Z(`div`,`pk-foot__right`);for(let[n,r,i]of e){let e=Z(`div`,`pk-hint`+(i?` pk-hint--btn`:``));for(let t of n.split(` `))e.appendChild(Z(`span`,`pk-key`,t));e.appendChild(Z(`span`,`pk-hint__l`,r)),i===`ok`&&t&&e.addEventListener(`click`,e=>{e.stopPropagation(),this._locked||t()}),o.appendChild(e)}return i.append(a,o),i}_button(e,t=``){let n=Z(`div`,`pk-btn ${t}`);n.setAttribute(`role`,`button`);let r=Z(`div`,`pk-btn__in`),i=Z(`span`,`pk-btn__shine`);return r.append(i,Z(`span`,`pk-btn__label`,e)),n.appendChild(r),n}_menuList(e,{initial:t=0,onPick:n,horizontal:r=!1}){let i=e.length,a=-1,o=(t,n)=>{t!==a&&(a>=0&&e[a].classList.remove(`is-focus`),a=t,e[a].classList.add(`is-focus`),n||this._sfx(`menu_move`))},s=()=>{e[a].classList.add(`is-pressed`),n(a)};return e.forEach((e,t)=>{e.addEventListener(`pointerenter`,()=>{this._mouseArmed&&!this._locked&&o(t)}),e.addEventListener(`click`,e=>{e.stopPropagation(),!this._locked&&(o(t,!0),s())})}),o(t,!0),e=>{e===(r?`left`:`up`)||e===(r?`up`:`left`)?o((a-1+i)%i):e===(r?`right`:`down`)||e===(r?`down`:`right`)?o((a+1)%i):e===`ok`&&s()}}showTitle({onStart:e,controls:t=Df}={}){let n=Z(`div`,`pk-scr pk-title`);n.appendChild(Z(`div`,`pk-title__shade`));let r=Z(`div`,`pk-petals`);for(let e=0;e<16;e++){let t=Z(`i`,`pk-petal`),n=t=>(Math.sin((e+1)*12.9898*t)*43758.5453%1+1)%1;t.style.setProperty(`--x`,`${(n(1)*100).toFixed(1)}vw`),t.style.setProperty(`--dx`,`${(n(2)*30-10).toFixed(1)}vw`),t.style.setProperty(`--d`,`${(9+n(3)*8).toFixed(2)}s`),t.style.setProperty(`--delay`,`${(-n(4)*16).toFixed(2)}s`),t.style.setProperty(`--s`,(.55+n(5)*.7).toFixed(2)),t.style.setProperty(`--sw`,`${(2.2+n(6)*2).toFixed(2)}s`),t.appendChild(Z(`i`,`pk-petal__in`)),r.appendChild(t)}n.appendChild(r);let i=Z(`div`,`pk-title__main`),a=Z(`div`,`pk-logo`);a.appendChild(Z(`div`,`pk-logo__glow`)),a.appendChild(Z(`div`,`pk-logo__disc`));let o=Z(`div`,`pk-logo__row pk-logo__row--a`),s=Z(`div`,`pk-logo__row pk-logo__row--b`),c=(e,t,n)=>{[...t].forEach((t,r)=>{let i=n+r,a=Z(`span`,`pk-lc`);a.style.setProperty(`--i`,i);let o=Z(`span`,`pk-lc__bob`);o.appendChild(Af(t,`pk-d pk-lc__t`)),a.appendChild(o),e.appendChild(a)})};c(o,`ぽんぽこ`,0),c(s,`カート`,4),a.append(o,s),a.appendChild(Z(`div`,`pk-logo__leaf`)),a.appendChild(Z(`div`,`pk-logo__en`,`PONPOKO KART`));let l=Z(`div`,`pk-logo__ribbon`);l.appendChild(Z(`span`,`pk-logo__ribbon-end pk-logo__ribbon-end--l`)),l.appendChild(Z(`span`,`pk-logo__ribbon-end pk-logo__ribbon-end--r`));let u=Z(`span`,`pk-logo__ribbon-body`);u.appendChild(Af(`ニッポン爆走グランプリ`,`pk-d pk-logo__ribbon-text`)),l.appendChild(u),a.appendChild(l),i.appendChild(a);let d=Z(`div`,`pk-title__start`);d.appendChild(Z(`span`,`pk-title__tri`)),d.appendChild(Z(`span`,`pk-title__start-t`,`Enter または クリックでスタート`)),d.appendChild(Z(`span`,`pk-title__tri pk-title__tri--r`)),i.appendChild(d),n.appendChild(i);let f=Z(`div`,`pk-title__bottom`),p=Z(`div`,`pk-controls`);for(let[e,n]of t||[]){let t=Z(`div`,`pk-controls__row`);t.appendChild(Z(`span`,`pk-controls__k`,e)),t.appendChild(Z(`span`,`pk-controls__l`,n)),p.appendChild(t)}f.appendChild(p),f.appendChild(Z(`div`,`pk-credit`,`© 2026 たぬ`)),n.appendChild(f);let m=()=>{this._locked||(n.classList.add(`is-starting`),this._pick(e,420))};n.addEventListener(`click`,m),this._open(`title`,n,{nav:e=>{e===`ok`&&m()}})}showCharacterSelect({characters:e=[],selectedId:t,onHover:n,onConfirm:r,onBack:i}={}){let a=e.slice();this._rememberChars(a);let o=a.length;if(!o)return;let s=o<=4?o:Math.ceil(o/2),c=Math.ceil(o/s),l=Z(`div`,`pk-scr pk-chars`);l.appendChild(Z(`div`,`pk-vignette`)),l.appendChild(this._topbar(`キャラクターをえらぶ`,`CHOOSE YOUR RACER`,0));let u=Z(`div`,`pk-chars__panel`),d=Z(`div`,`pk-chars__grid`);d.style.setProperty(`--cols`,s);let f=-1,p=a.map((e,t)=>{let n=Z(`div`,`pk-ccard`);n.style.setProperty(`--cc`,Pf(e)),n.style.setProperty(`--i`,t);let r=Z(`div`,`pk-ccard__in`),i=Z(`div`,`pk-ccard__art`);return i.appendChild(this._portrait(e.id,`pk-ccard__portrait`)),r.appendChild(i),r.appendChild(Z(`div`,`pk-ccard__name`,e.name)),r.appendChild(Z(`div`,`pk-ccard__tag`,`1P`)),r.appendChild(Z(`div`,`pk-ccard__stamp`,`決定`)),n.appendChild(r),n.addEventListener(`pointerenter`,()=>{this._mouseArmed&&!this._locked&&k(t)}),n.addEventListener(`click`,e=>{e.stopPropagation(),!this._locked&&(k(t,!0),E())}),d.appendChild(n),n});u.appendChild(d),l.appendChild(u),l.appendChild(Z(`div`,`pk-preview-slot pk-preview-slot--chars`));let m=Z(`div`,`pk-cinfo`),h=Z(`div`,`pk-cinfo__band`),g=Z(`div`,`pk-cinfo__kanji`),_=Z(`div`,`pk-cinfo__body`),v=Z(`div`,`pk-cinfo__top`),y=Z(`span`,`pk-cinfo__type`),b=Z(`span`,`pk-cinfo__romaji`);v.append(y,b);let x=Af(``,`pk-d pk-cinfo__name`),S=Z(`div`,`pk-cinfo__desc`),C=Z(`div`,`pk-stats`),w={};for(let[e,t]of Sf){let n=Z(`div`,`pk-stat`);n.appendChild(Z(`span`,`pk-stat__label`,t));let r=Z(`span`,`pk-stat__bar`);w[e]=[];for(let t=0;t<5;t++){let t=Z(`i`);r.appendChild(t),w[e].push(t)}n.appendChild(r),C.appendChild(n)}let T=this._button(`このキャラで けってい！`,`pk-btn--cta`);T.addEventListener(`click`,e=>{e.stopPropagation(),this._locked||E()}),_.append(v,x,S,C),m.append(h,g,_,T),l.appendChild(m);let E=()=>{this._locked||(p[f].classList.add(`is-picked`),T.classList.add(`is-pressed`),this._pick(()=>r&&r(a[f].id),480))},D=()=>this._goBack(i);l.appendChild(this._footer([[`← ↑ ↓ →`,`えらぶ`],[`Enter`,`けってい`,`ok`]],{ok:E,back:i?D:null}));let O=(e,t)=>{m.style.setProperty(`--cc`,Pf(e)),g.textContent=e.kanji||wf[e.id]||``,y.textContent=Ff(e),b.textContent=(e.romaji||e.id||``).toUpperCase(),jf(x,e.name||``),S.textContent=e.description||``;for(let[n]of Sf){let r=Math.max(0,Math.min(5,Math.round(e.stats&&e.stats[n]||0)));w[n].forEach((e,n)=>{let i=n<r;e.classList.toggle(`on`,i),t&&i&&e.animate([{transform:`skewX(-18deg) scaleY(0.2)`,opacity:.2},{transform:`skewX(-18deg) scaleY(1.25)`,opacity:1,offset:.6},{transform:`skewX(-18deg) scaleY(1)`,opacity:1}],{duration:260,delay:n*45,easing:`cubic-bezier(.3,.7,.4,1)`,fill:`backwards`})})}t&&(_.animate([{opacity:0,transform:`translateX(${14*If()}px)`},{opacity:1,transform:`none`}],{duration:240,easing:`cubic-bezier(.2,.8,.3,1)`}),g.animate([{opacity:0,transform:`scale(1.25) rotate(6deg)`},{opacity:1,transform:`none`}],{duration:320,easing:`cubic-bezier(.2,.8,.3,1)`}))},k=(e,t=!1)=>{if(e===f)return;f>=0&&p[f].classList.remove(`is-focus`);let r=f<0;f=e,p[f].classList.add(`is-focus`),O(a[f],!r),!r&&!t&&this._sfx(`menu_move`),typeof n==`function`&&n(a[f].id)};this._open(`chars`,l,{nav:e=>{let t=Math.floor(f/s),n=f%s,r=t===c-1?o-t*s:s;if(e===`left`)k(t*s+(n-1+r)%r);else if(e===`right`)k(t*s+(n+1)%r);else if(e===`up`||e===`down`){if(c<2)return;let r=(t+(e===`up`?-1:1)+c)%c;k(Math.min(r*s+n,o-1))}else e===`ok`?E():e===`back`&&D()}});let A=a.findIndex(e=>e.id===t);k(A>=0?A:0)}showCourseSelect({courses:e=[],selectedId:t,difficulty:n=`100cc`,onHover:r,onConfirm:i,onBack:a}={}){let o=e.slice(),s=o.length;if(!s)return;let c=Z(`div`,`pk-scr pk-courses`);c.appendChild(Z(`div`,`pk-vignette pk-vignette--course`)),c.appendChild(this._topbar(`コースをえらぶ`,`SELECT COURSE`,1));let l=Z(`div`,`pk-courses__col`),u=Z(`div`,`pk-courses__list`),d=Math.max(0,o.findIndex(e=>e.id===t)),f=d,p=Math.max(0,Cf.findIndex(e=>e.id===n)),m=o.map((e,t)=>{let n=Z(`div`,`pk-course`),[r,i]=(e.colors&&e.colors.length?e.colors:[`#e0b04a`,`#d8401f`]).map(Mf);n.style.setProperty(`--ca`,r),n.style.setProperty(`--cb`,i||r),n.style.setProperty(`--i`,t);let a=Z(`div`,`pk-course__in`),o=Z(`div`,`pk-course__num`,Tf[t]||String(t+1)),s=new Image;s.className=`pk-course__emblem`,s.alt=``,s.draggable=!1,s.src=Kd(vf(e.id,[r,i||r]));let c=Z(`div`,`pk-course__txt`);c.appendChild(Z(`div`,`pk-course__name pk-d`,e.name||e.id)),c.appendChild(Z(`div`,`pk-course__sub`,e.subtitle||``));let l=Z(`div`,`pk-course__laps`);return l.appendChild(Z(`b`,`pk-d`,String(e.laps||3))),l.appendChild(Z(`span`,null,`周`)),a.append(o,s,c,l),n.appendChild(a),n.addEventListener(`pointerenter`,()=>{this._mouseArmed&&!this._locked&&N(t)}),n.addEventListener(`click`,e=>{e.stopPropagation(),!this._locked&&(N(t,!0),A())}),u.appendChild(n),n});l.appendChild(u);let h=Z(`div`,`pk-diff`),g=Z(`div`,`pk-diff__head`);g.appendChild(Z(`span`,`pk-diff__label`,`むずかしさ`));let _=Z(`span`,`pk-diff__hint`);_.append(Z(`span`,`pk-key pk-key--s`,`←`),Z(`span`,`pk-key pk-key--s`,`→`),Z(`span`,null,`でかえる`)),g.appendChild(_);let v=Z(`div`,`pk-diff__row`);v.appendChild(Z(`span`,`pk-diff__arrow pk-diff__arrow--l`));let y=Cf.map((e,t)=>{let n=Z(`div`,`pk-diff__opt`);n.style.setProperty(`--lv`,e.lv),n.appendChild(Z(`span`,`pk-diff__cc pk-d`,e.id)),n.appendChild(Z(`span`,`pk-diff__jp`,e.label));let r=Z(`span`,`pk-diff__lv`);for(let t=0;t<3;t++)r.appendChild(Z(`i`,t<e.lv?`on`:``));return n.appendChild(r),n.addEventListener(`pointerenter`,()=>{this._mouseArmed&&!this._locked&&N(s)}),n.addEventListener(`click`,e=>{e.stopPropagation(),!this._locked&&(N(s,!0),M(t))}),v.appendChild(n),n});v.appendChild(Z(`span`,`pk-diff__arrow pk-diff__arrow--r`)),h.append(g,v),l.appendChild(h);let b=this._button(`しゅっぱつ！`,`pk-btn--cta pk-btn--go`);b.addEventListener(`click`,e=>{e.stopPropagation(),this._locked||A()}),l.appendChild(b),c.appendChild(l);let x=Z(`div`,`pk-preview-slot pk-preview-slot--course`);for(let e of[`tl`,`tr`,`bl`,`br`])x.appendChild(Z(`i`,`pk-corner pk-corner--${e}`));c.appendChild(x);let S=Z(`div`,`pk-coinfo`),C=Z(`div`,`pk-coinfo__num`),w=Af(``,`pk-d pk-coinfo__name`),T=Z(`div`,`pk-coinfo__sub`),E=Z(`div`,`pk-coinfo__desc`),D=Z(`div`,`pk-coinfo__chips`),O=Z(`span`,`pk-chip`),k=Z(`span`,`pk-chip pk-chip--shu`);D.append(O,k),S.append(Z(`div`,`pk-coinfo__stripe`),C,w,T,E,D),c.appendChild(S);let A=()=>{this._locked||(m[d].classList.add(`is-picked`),b.classList.add(`is-pressed`),this._pick(()=>i&&i({courseId:o[d].id,difficulty:Cf[p].id}),420))},ee=()=>this._goBack(a);c.appendChild(this._footer([[`↑ ↓`,`コース`],[`← →`,`むずかしさ`],[`Enter`,`しゅっぱつ`,`ok`]],{ok:A,back:a?ee:null}));let te=e=>{let t=o[d],[n,r]=(t.colors&&t.colors.length?t.colors:[`#e0b04a`,`#d8401f`]).map(Mf);S.style.setProperty(`--ca`,n),S.style.setProperty(`--cb`,r||n),C.textContent=`COURSE ${d+1}`,jf(w,t.name||t.id),T.textContent=t.subtitle||``,E.textContent=t.description||``,O.textContent=`${t.laps||3}周`,e&&S.animate([{opacity:0,transform:`translateY(${10*If()}px)`},{opacity:1,transform:`none`}],{duration:260,easing:`cubic-bezier(.2,.8,.3,1)`})},j=()=>{y.forEach((e,t)=>e.classList.toggle(`is-on`,t===p)),k.textContent=`${Cf[p].id}  ${Cf[p].label}`,h.classList.toggle(`at-min`,p===0),h.classList.toggle(`at-max`,p===Cf.length-1)},M=e=>{let t=Math.max(0,Math.min(Cf.length-1,e));if(t===p){v.animate([{transform:`translateX(0)`},{transform:`translateX(${(e<p?-5:5)*If()}px)`},{transform:`translateX(0)`}],{duration:160});return}p=t,j(),y[p].animate([{transform:`scale(1.18)`},{transform:`scale(1)`}],{duration:220,easing:`cubic-bezier(.3,1.6,.5,1)`}),this._sfx(`menu_move`)},N=(e,t=!1)=>{if(e===f&&!t)return;let n=f;f=e,m.forEach((e,t)=>e.classList.toggle(`is-focus`,t===f)),h.classList.toggle(`is-focus`,f===s),f<s&&f!==d&&(d=f,m.forEach((e,t)=>e.classList.toggle(`is-sel`,t===d)),te(!0),typeof r==`function`&&r(o[d].id)),!t&&n!==f&&this._sfx(`menu_move`)};this._open(`course`,c,{nav:e=>{e===`up`?N((f-1+s+1)%(s+1)):e===`down`?N((f+1)%(s+1)):(e===`left`||e===`right`)&&f===s?M(p+(e===`left`?-1:1)):e===`ok`?A():e===`back`&&ee()}}),m.forEach((e,t)=>{e.classList.toggle(`is-sel`,t===d),e.classList.toggle(`is-focus`,t===f)}),te(!1),j(),typeof r==`function`&&r(o[d].id)}_buildLoading(){let e=Z(`div`,`pk-layer pk-loading pk-hidden`);e.appendChild(Z(`div`,`pk-loading__bg`));let t=Z(`div`,`pk-loading__center`),n=Z(`div`,`pk-loading__title`);t.appendChild(n);let r=Z(`div`,`pk-loading__drum`);r.appendChild(Z(`div`,`pk-loading__tacks`)),r.appendChild(Z(`div`,`pk-loading__tomoe`));let i=Z(`div`,`pk-loading__text`),a=Z(`span`,`pk-loading__label`),o=Z(`span`,`pk-dots`);for(let e=0;e<3;e++)o.appendChild(Z(`i`,null,`・`));i.append(a,o),t.append(r,i);let s=Z(`div`,`pk-loading__tip`);s.appendChild(Z(`span`,`pk-loading__tiplabel`,`ヒント`));let c=Z(`span`,`pk-loading__tiptext`);s.appendChild(c),e.append(t,s,Z(`div`,`pk-loading__wave`)),this.el.appendChild(e),this._loading={root:e,label:a,tipText:c,title:n,anim:null}}showLoading(e=`コースを準備中…`,{tip:t,title:n}={}){let r=this._loading;r.label.textContent=String(e).replace(/(…|\.\.\.|・・・)$/,``),r.title.textContent=n||``,r.title.classList.toggle(`pk-hidden`,!n),r.tipText.textContent=t||Of[Math.floor(Math.random()*Of.length)],!this._loadingOn&&(this._loadingOn=!0,r.anim&&r.anim.cancel(),r.root.classList.remove(`pk-hidden`),r.anim=r.root.animate([{opacity:0},{opacity:1}],{duration:220,easing:`ease-out`}))}hideLoading(){let e=this._loading;this._loadingOn&&(this._loadingOn=!1,e.anim&&e.anim.cancel(),e.anim=e.root.animate([{opacity:1},{opacity:0}],{duration:260,easing:`ease-in`,fill:`forwards`}),e.anim.onfinish=()=>{this._loadingOn||(e.root.classList.add(`pk-hidden`),e.anim.cancel())},this._fade.closed||this._releaseHeld())}_buildHUD(){let e=Z(`div`,`pk-layer pk-hud pk-hidden`),t=Z(`div`,`pk-hud__item`),n=Z(`div`,`pk-islot is-empty`),r=Z(`div`,`pk-islot__glow`),i=Z(`div`,`pk-islot__ring`),a=Z(`div`,`pk-islot__face`),o=Z(`div`,`pk-islot__reel`),s=new Image;s.className=`pk-islot__img`,s.alt=``,s.draggable=!1,o.appendChild(s),a.appendChild(o);let c=Z(`div`,`pk-islot__flash`),l=Z(`div`,`pk-islot__count pk-d`);n.append(r,i,a,c,l),t.appendChild(n);let u=Z(`div`,`pk-hud__tr`),d=Z(`div`,`pk-lap`),f=Af(`LAP`,`pk-d pk-lap__label`),p=Af(`1`,`pk-d pk-lap__num`),m=Af(`/3`,`pk-d pk-lap__tot`);d.append(f,p,m);let h=Z(`div`,`pk-time`);h.appendChild(Z(`span`,`pk-time__icon`));let g=Z(`span`,`pk-time__digits pk-d`);h.appendChild(g);let _=Z(`canvas`,`pk-map`);u.append(d,h,_);let v=Z(`div`,`pk-hud__bl`),y=Z(`div`,`pk-coins`),b=new Image;b.className=`pk-coins__icon`,b.alt=``,b.draggable=!1,b.src=this._itemSrc(`koban`);let x=Af(`×`,`pk-d pk-coins__x`),S=Af(`0`,`pk-d pk-coins__num`);y.append(b,x,S);let C=Z(`div`,`pk-speed`),w=Z(`span`,`pk-speed__digits pk-d`),T=Z(`span`,`pk-speed__bar`),E=Z(`i`);T.appendChild(E),C.append(w,Z(`span`,`pk-speed__unit`,`km/h`),T),v.append(y,C);let D=Z(`div`,`pk-hud__pos`),O=Z(`div`,`pk-pos pk-pos--1`),k=Af(`1`,`pk-d pk-pos__n`),A=Af(`位`,`pk-d pk-pos__s`);O.append(k,A);let ee=Z(`div`,`pk-pos__delta`);D.append(O,ee),e.append(t,u,v,D),this._hud={root:e,slot:n,img:s,reel:o,count:l,flash:c,lapNum:p,lapTot:m,lap:d,timeDigits:new Bf(g),map:_,coins:y,coinIcon:b,coinNum:S,speedDigits:new Bf(w),speedFill:E,pos:O,posNum:k,posSuf:A,posDelta:ee,shownItem:null,cache:{},visible:!1},this._minimap=new yf(_)}showHUD(){let e=this._hud;e.visible||(e.visible=!0,e.root.classList.remove(`pk-hidden`),e.root.animate([{opacity:0},{opacity:1}],{duration:300,easing:`ease-out`}))}hideHUD(){let e=this._hud;e.visible=!1,e.root.classList.add(`pk-hidden`),this._stopRoulette(!1),this.showWrongWay(!1)}updateHUD(e={}){let t=this._hud,n=t.cache;if(e.position!==void 0&&(e.position!==n.position||e.total!==n.total)){let t=n.position;n.position=e.position,n.total=e.total,this._setPosition(e.position,t)}if(e.lap!==void 0&&(e.lap!==n.lap||e.laps!==n.laps)){let r=n.lap;n.lap=e.lap,n.laps=e.laps;let i=e.laps||3;jf(t.lapNum,String(Math.max(1,Math.min(i,e.lap||1)))),jf(t.lapTot,`/${i}`),r!==void 0&&e.lap!==r&&t.lap.animate([{transform:`scale(1.45)`},{transform:`scale(.92)`,offset:.55},{transform:`scale(1)`}],{duration:420,easing:`cubic-bezier(.2,.8,.3,1)`})}if(e.time!==void 0&&t.timeDigits.set(kf(e.time??0)),e.coins!==void 0&&e.coins!==n.coins){let r=n.coins;n.coins=e.coins;let i=Math.max(0,e.coins|0);jf(t.coinNum,String(i)),t.coins.classList.toggle(`is-max`,i>=10),r!==void 0&&i>r?(t.coinIcon.animate([{transform:`scale(1.35) rotate(-12deg)`},{transform:`scale(1)`}],{duration:300,easing:`cubic-bezier(.3,1.5,.5,1)`}),t.coinNum.animate([{transform:`translateY(-18%) scale(1.2)`},{transform:`none`}],{duration:260,easing:`cubic-bezier(.3,1.5,.5,1)`})):r!==void 0&&i<r&&t.coins.animate([{transform:`translateX(-4%)`},{transform:`translateX(4%)`},{transform:`translateX(-2%)`},{transform:`none`}],{duration:260})}if(e.speedKmh!==void 0){let r=Math.max(0,Math.round(e.speedKmh||0));r!==n.speed&&(n.speed=r,t.speedDigits.set(String(r).padStart(3,` `)),t.speedFill.style.transform=`scaleX(${Math.min(1,r/(this.speedGaugeMax||160)).toFixed(3)})`)}let r=e.item===void 0?n.item:e.item||null,i=e.itemCount===void 0?n.itemCount:e.itemCount;(r!==n.item||i!==n.itemCount)&&(this._roulette?(n.item=r,n.itemCount=i):r==null&&performance.now()<(this._rouletteGraceUntil||0)||(n.item=r,n.itemCount=i,this._renderItem(r,i,!0)))}_setPosition(e,t){let n=this._hud,r=Math.max(1,e|0);if(jf(n.posNum,String(r)),n.pos.className=`pk-pos pk-pos--${r<=3?r:`n`}`,t!==void 0&&t!==r){n.pos.animate([{transform:`scale(1.55) rotate(-8deg)`},{transform:`scale(.9) rotate(2deg)`,offset:.5},{transform:`scale(1.04)`,offset:.75},{transform:`none`}],{duration:460,easing:`cubic-bezier(.2,.8,.3,1)`});let e=r<t;n.posDelta.className=`pk-pos__delta ${e?`is-up`:`is-down`}`,n.posDelta.animate([{opacity:0,transform:`translateY(${e?20:-20}%)`},{opacity:1,transform:`none`,offset:.2},{opacity:1,offset:.7},{opacity:0,transform:`translateY(${e?-40:40}%)`}],{duration:800,easing:`ease-out`})}}_renderItem(e,t,n){let r=this._hud,i=r.shownItem;if(r.shownItem=e,!e){i?(r.slot.classList.add(`is-empty`),r.reel.animate([{transform:`scale(1)`,opacity:1},{transform:`scale(.3) rotate(-30deg)`,opacity:0}],{duration:200,easing:`ease-in`})):r.slot.classList.add(`is-empty`),r.count.textContent=``,r.count.classList.remove(`is-on`);return}r.slot.classList.remove(`is-empty`),r.img.src=this._itemSrc(e);let a=t|0;r.count.textContent=a>1?`×${a}`:``,r.count.classList.toggle(`is-on`,a>1),n&&e!==i&&r.reel.animate([{transform:`scale(.4)`,opacity:0},{transform:`scale(1.15)`,opacity:1,offset:.6},{transform:`scale(1)`}],{duration:260,easing:`cubic-bezier(.3,1.4,.5,1)`})}rouletteItem(e,t=1800){this._stopRoulette(!1);let n=this._hud,r=Ef.slice(),i=Math.floor(Math.random()*r.length),a=0;return n.slot.classList.remove(`is-empty`),n.slot.classList.add(`is-rolling`),n.count.classList.remove(`is-on`),new Promise(o=>{let s=this._roulette={timer:null,resolve:o},c=()=>{this._roulette=null,n.slot.classList.remove(`is-rolling`),this._hud.cache.item=e,this._rouletteGraceUntil=performance.now()+300,this._renderItem(e||null,this._hud.cache.itemCount,!1),e&&(n.reel.animate([{transform:`scale(1.7)`,opacity:.4},{transform:`scale(.86)`,opacity:1,offset:.45},{transform:`scale(1.08)`,offset:.75},{transform:`scale(1)`}],{duration:420,easing:`cubic-bezier(.2,.8,.3,1)`}),n.flash.animate([{opacity:.95,transform:`scale(.7)`},{opacity:0,transform:`scale(1.6)`}],{duration:520,easing:`ease-out`}),n.slot.animate([{transform:`scale(1.12)`},{transform:`scale(1)`}],{duration:300,easing:`cubic-bezier(.3,1.6,.5,1)`}),this._sfx(`item_get`)),o(e)},l=()=>{let e=a/t;if(e>=1){c();return}i=(i+1)%r.length,n.img.src=this._itemSrc(r[i]);let o=55+250*e**2.3;n.reel.animate([{transform:`translateY(-70%)`,opacity:.2},{transform:`translateY(6%)`,opacity:1,offset:.75},{transform:`translateY(0)`}],{duration:Math.max(50,o*.9),easing:`ease-out`}),this._sfx(`roulette`),a+=o,s.timer=setTimeout(l,o)};l()})}_stopRoulette(e){let t=this._roulette;t&&(clearTimeout(t.timer),this._roulette=null,this._hud.slot.classList.remove(`is-rolling`),e||(this._renderItem(this._hud.cache.item||null,this._hud.cache.itemCount,!1),t.resolve(null)))}setMinimap(e){this._minimap.setPath(e)}updateMinimap(e){this._hud.visible&&this._minimap.draw(e)}countdown(e){let t=!(e>0),n=Z(`div`,`pk-count ${t?`pk-count--go`:`pk-count--${Math.min(3,e)}`}`);if(n.appendChild(Z(`div`,`pk-count__ring`)),n.appendChild(Z(`div`,`pk-count__ring pk-count__ring--b`)),t){let e=Z(`div`,`pk-count__burst`);for(let t=0;t<12;t++){let n=Z(`i`);n.style.setProperty(`--a`,`${t*30+15}deg`),e.appendChild(n)}n.appendChild(e)}n.appendChild(Af(t?`GO!`:String(e),`pk-d pk-count__num`)),this._fx.appendChild(n),this._later(()=>n.remove(),t?1500:1050)}banner(e,{style:t=`info`,durationMs:n=2e3}={}){let r=Math.max(700,n),i=Z(`div`,`pk-banner pk-banner--${t}`),a=Z(`div`,`pk-banner__band`);a.appendChild(Z(`div`,`pk-banner__pat`));let o=Af(e,`pk-d pk-banner__text`);i.append(a,o),this._fx.appendChild(i);let s=Math.min(.3,340/r),c=Math.max(.7,1-320/r),l=window.innerWidth,u=`cubic-bezier(.15,.85,.3,1)`,d=`cubic-bezier(.6,0,.9,.45)`,f={duration:r,fill:`both`};return t===`final`?(a.animate([{transform:`scaleY(0)`,easing:u},{transform:`scaleY(1.18)`,offset:s*.55,easing:`ease-in-out`},{transform:`scaleY(1)`,offset:s},{transform:`scaleY(1)`,offset:c,easing:d},{transform:`scaleY(0)`}],f),a.firstChild.animate([{transform:`translateX(0)`},{transform:`translateX(${-l*.12}px)`}],{duration:r,fill:`both`}),o.animate([{transform:`translateX(${l*.75}px) skewX(-14deg)`,easing:u},{transform:`translateX(0) skewX(-4deg)`,offset:s},{transform:`translateX(${-l*.035}px) skewX(-4deg)`,offset:c,easing:d},{transform:`translateX(${-l*.8}px) skewX(-14deg)`}],f)):t===`finish`?(a.animate([{transform:`scaleX(0)`,opacity:1,easing:u},{transform:`scaleX(1)`,opacity:1,offset:s},{transform:`scaleX(1)`,opacity:1,offset:c,easing:`ease-in`},{transform:`scaleX(1)`,opacity:0}],f),o.animate([{transform:`scale(3) rotate(-8deg)`,opacity:0,easing:`cubic-bezier(.3,0,.7,.6)`},{transform:`scale(.86) rotate(2deg)`,opacity:1,offset:s*.75,easing:`ease-out`},{transform:`scale(1.07) rotate(-1deg)`,opacity:1,offset:s*1.25,easing:`ease-in-out`},{transform:`scale(1) rotate(0deg)`,opacity:1,offset:s*1.7},{transform:`scale(1) rotate(0deg)`,opacity:1,offset:c,easing:`ease-in`},{transform:`scale(1.3) rotate(0deg)`,opacity:0}],f),this._later(()=>this._confetti(i),r*s*.7)):(a.animate([{transform:`scaleX(0)`,opacity:1,easing:u},{transform:`scaleX(1)`,opacity:1,offset:s},{transform:`scaleX(1)`,opacity:1,offset:c,easing:`ease-in`},{transform:`scaleX(1)`,opacity:0}],f),o.animate([{transform:`translateX(${l*.22}px)`,opacity:0,easing:u},{transform:`translateX(0)`,opacity:1,offset:s},{transform:`translateX(${-l*.01}px)`,opacity:1,offset:c,easing:d},{transform:`translateX(${-l*.2}px)`,opacity:0}],f)),new Promise(e=>this._later(()=>{i.remove(),e()},r+40))}_confetti(e){let t=window.innerWidth,n=window.innerHeight,r=If(),i=[`#d8401f`,`#e0b04a`,`#f8dd8c`,`#f7f1e3`,`#f4a7b9`,`#3a5895`,`#7da34a`,`#ff8a3d`],a=Z(`div`,`pk-confetti-layer`);e.appendChild(a);let o=(e,t,o,s,c,l)=>{for(let u=0;u<c;u++){let c=u%5==0?`is-petal`:u%3==0?`is-round`:``,d=Z(`i`,`pk-confetti ${c}`),f=(7+Math.random()*9)*r;d.style.width=`${f}px`,d.style.height=`${c===`is-petal`?f*1.1:c===`is-round`?f*.8:f*.55}px`,c!==`is-petal`&&(d.style.background=i[Math.random()*i.length|0]),d.style.left=`${e}px`,d.style.top=`${t}px`,a.appendChild(d);let p=o+(Math.random()-.5)*s,m=(.45+Math.random()*.55)*l,h=Math.cos(p)*m,g=Math.sin(p)*m,_=h*1.25+(Math.random()-.5)*160*r,v=g+n*(.55+Math.random()*.45),y=(Math.random()-.5)*1600,b=1700+Math.random()*1300;d.animate([{transform:`translate(0,0) rotate(0deg) scale(.5)`,opacity:1,easing:`cubic-bezier(.1,.75,.3,1)`},{transform:`translate(${h}px,${g}px) rotate(${y*.35}deg) scale(1)`,opacity:1,offset:.3,easing:`cubic-bezier(.45,0,.8,.6)`},{transform:`translate(${_}px,${v}px) rotate(${y}deg) scale(.9)`,opacity:0}],{duration:b,delay:Math.random()*140,fill:`both`})}};o(t*.5,n*.44,-Math.PI/2,Math.PI*1.6,34,n*.55),o(-10*r,n*1.02,-Math.PI*.32,.55,26,n*1.05),o(t+10*r,n*1.02,-Math.PI*.68,.55,26,n*1.05),this._later(()=>a.remove(),3400)}toast(e,{style:t}={}){let n=this._toasts;(!n||!n.isConnected)&&(n=this._toasts=Z(`div`,`pk-toasts`),this._fx.appendChild(n));let r=[...n.children].filter(e=>!e.classList.contains(`is-out`)),i=r.map(e=>e.getBoundingClientRect().top);for(;r.length>=3;){let e=r.shift();i.shift(),e.remove()}let a=Z(`div`,`pk-toast${t?` pk-toast--${t}`:``}`);a.appendChild(Z(`span`,`pk-toast__spark`)),a.appendChild(Af(e,`pk-d pk-toast__t`)),a.appendChild(Z(`span`,`pk-toast__spark pk-toast__spark--r`)),n.appendChild(a),r.forEach((e,t)=>{let n=i[t]-e.getBoundingClientRect().top;n&&e.animate([{transform:`translateY(${n}px)`},{transform:`none`}],{duration:180,easing:`ease-out`})}),a.animate([{transform:`scale(.4) translateY(40%)`,opacity:0},{transform:`scale(1.12)`,opacity:1,offset:.55},{transform:`scale(1)`,opacity:1}],{duration:260,easing:`cubic-bezier(.2,.8,.3,1.2)`}),this._later(()=>{a.classList.add(`is-out`);let e=a.animate([{opacity:1,transform:`none`},{opacity:0,transform:`translateY(-60%) scale(.9)`}],{duration:320,easing:`ease-in`,fill:`forwards`});e.onfinish=()=>a.remove()},1250)}_buildWrongWay(){let e=Z(`div`,`pk-wrong`),t=Z(`div`,`pk-wrong__in`);t.appendChild(Z(`span`,`pk-wrong__icon`)),t.appendChild(Af(`逆走中！`,`pk-d pk-wrong__t`)),e.appendChild(t),this._fx.appendChild(e),this._wrong=e,this._wrongOn=!1}showWrongWay(e){e=!!e,e!==this._wrongOn&&(this._wrongOn=e,this._wrong.classList.toggle(`is-on`,e))}showPause({onResume:e,onRestart:t,onQuit:n}={}){let r=Z(`div`,`pk-scr pk-pause`);r.appendChild(Z(`div`,`pk-pause__dim`));let i=Z(`div`,`pk-pause__panel`),a=Z(`div`,`pk-pause__title`);a.appendChild(Z(`div`,`pk-pause__brush`)),a.appendChild(Af(`ポーズ`,`pk-d pk-pause__t`)),i.appendChild(a),i.appendChild(Z(`div`,`pk-pause__leaf`));let o=[[`つづける`,e],[`やりなおす`,t],[`コースえらびへ`,n]],s=o.map(([e])=>this._button(e,`pk-btn--wide`)),c=Z(`div`,`pk-pause__btns`);s.forEach(e=>c.appendChild(e)),i.appendChild(c);let l=Z(`div`,`pk-pause__hint`);l.append(Z(`span`,`pk-key`,`↑`),Z(`span`,`pk-key`,`↓`),Z(`span`,null,`えらぶ`),Z(`span`,`pk-key`,`Enter`),Z(`span`,null,`けってい`),Z(`span`,`pk-key`,`Esc`),Z(`span`,null,`つづける`)),i.appendChild(l),r.appendChild(i);let u=this._menuList(s,{onPick:e=>this._pick(o[e][1],200)});this._open(`pause`,r,{nav:t=>{t===`back`?e&&(this._locked=!0,this._sfx(`menu_back`),this._later(e,60)):u(t)}})}hidePause(){this._screen&&this._screen.name===`pause`&&this._closeScreen()}showResults({rows:e=[],courseName:t=``,onRetry:n,onCourseSelect:r,onTitle:i}={}){let a=Z(`div`,`pk-scr pk-results`);a.appendChild(Z(`div`,`pk-results__shade`)),a.appendChild(this._topbar(`リザルト`,`RACE RESULTS`,null,t||null));let o=e.find(e=>e.isPlayer);if(o){let e=Z(`div`,`pk-rme`),t=o.rank|0,n=o.time==null;e.appendChild(Z(`div`,`pk-rme__label`,`あなたの順位`));let r=Z(`div`,`pk-pos pk-rme__pos pk-pos--${t>=1&&t<=3?t:`n`}`);r.append(Af(String(t||`-`),`pk-d pk-pos__n`),Af(`位`,`pk-d pk-pos__s`)),e.appendChild(r);let i=n?`リタイア…`:t===1?`優勝！`:t<=3?`表彰台！`:`ゴール！`,s=n?`つぎはゴールをめざそう！`:t===1?`おめでとう！`:t<=3?`ナイスラン！`:`つぎは表彰台をめざそう！`,c=Z(`div`,`pk-rme__msg`);c.appendChild(Af(i,`pk-d pk-rme__msgt`)),e.appendChild(c),e.appendChild(Z(`div`,`pk-rme__sub`,s));let l=Z(`div`,`pk-rme__time`);l.appendChild(Z(`span`,`pk-rme__timel`,`タイム`)),l.appendChild(Z(`span`,`pk-d`,kf(o.time))),e.appendChild(l),t===1&&e.classList.add(`is-win`),a.appendChild(e)}let s=Z(`div`,`pk-board`),c=Z(`div`,`pk-board__head`);c.append(Z(`span`,null,`順位`),Z(`span`,null,``),Z(`span`,null,`なまえ`),Z(`span`,null,`タイム`)),s.appendChild(c),e.forEach((e,t)=>{let n=Z(`div`,`pk-rrow`+(e.isPlayer?` is-player`:``));n.style.setProperty(`--i`,t),n.style.setProperty(`--rc`,Mf(e.color)||`#8f7760`);let r=Z(`div`,`pk-rrow__in`),i=Z(`div`,`pk-rrow__rank pk-rrow__rank--${e.rank>=1&&e.rank<=3?e.rank:`n`}`);i.appendChild(Z(`span`,`pk-d`,String(e.rank)));let a=this._portrait(e.characterId,`pk-rrow__face`,Mf(e.color)),o=Z(`div`,`pk-rrow__name`);o.appendChild(Z(`span`,null,e.name||``)),e.isPlayer&&o.appendChild(Z(`span`,`pk-rrow__you`,`あなた`));let c=Z(`div`,`pk-rrow__time pk-d`,e.time==null?`--`:kf(e.time));r.append(i,a,o,c),n.appendChild(r),s.appendChild(n)}),a.appendChild(s);let l=[[`もういちど`,n],[`コースえらび`,r],[`タイトルへ`,i]],u=Z(`div`,`pk-results__btns`),d=l.map(([e],t)=>{let n=this._button(e,t===0?`pk-btn--primary`:``);return n.style.setProperty(`--i`,t),u.appendChild(n),n});a.appendChild(u);let f=this._menuList(d,{horizontal:!0,onPick:e=>this._pick(l[e][1],220)});this._open(`results`,a,{nav:e=>{e!==`back`&&f(e)}})}_buildFade(){let e=Z(`div`,`pk-layer pk-fade`),t=Z(`div`,`pk-fade__black`),n=Z(`div`,`pk-door pk-door--l`),r=Z(`div`,`pk-door pk-door--r`);for(let e of[n,r])e.appendChild(Z(`div`,`pk-door__lattice`)),e.appendChild(Z(`div`,`pk-door__kick`)),e.appendChild(Z(`div`,`pk-door__crest`));e.append(t,n,r),this.el.appendChild(e),this._fade={root:e,black:t,l:n,r,closed:!1,token:0,anims:[]}}fade(e,t=400,{style:n=`doors`}={}){let r=this._fade,i=++r.token;r.anims.forEach(e=>{try{e.commitStyles()}catch{}e.cancel()}),r.anims=[],r.closed=!!e,r.root.classList.toggle(`is-blocking`,!!e),e||this._releaseHeld();let a=Math.max(1,t),o=[],s=e?`translateX(0%)`:`translateX(-101%)`,c=e?`translateX(0%)`:`translateX(101%)`;if(n===`black`){let t=getComputedStyle(r.black).opacity;o.push(r.black.animate([{opacity:t},{opacity:+!!e}],{duration:a,easing:`ease-in-out`,fill:`forwards`}))}else{let t=getComputedStyle(r.l).transform,n=getComputedStyle(r.r).transform,i=e?`cubic-bezier(.62,0,.84,.5)`:`cubic-bezier(.2,.6,.35,1)`;o.push(r.l.animate([{transform:t===`none`?`translateX(-101%)`:t},{transform:s}],{duration:a,easing:i,fill:`forwards`})),o.push(r.r.animate([{transform:n===`none`?`translateX(101%)`:n},{transform:c}],{duration:a,easing:i,fill:`forwards`})),!e&&getComputedStyle(r.black).opacity!==`0`&&o.push(r.black.animate([{opacity:getComputedStyle(r.black).opacity},{opacity:0}],{duration:a*.6,fill:`forwards`}))}return r.anims=o,new Promise(t=>{Promise.all(o.map(e=>e.finished.catch(()=>null))).then(()=>{i===r.token&&(n===`black`?(r.black.style.opacity=e?`1`:`0`,e||(r.l.style.transform=``,r.r.style.transform=``)):(r.l.style.transform=e?s:``,r.r.style.transform=e?c:``,e||(r.black.style.opacity=`0`)),o.forEach(e=>e.cancel()),r.anims=[],e&&n!==`black`&&r.root.animate([{transform:`translateY(0)`},{transform:`translateY(${3*If()}px)`},{transform:`translateY(0)`}],{duration:120,easing:`ease-out`})),t()})})}dispose(){window.removeEventListener(`keydown`,this._onKeyDown,!0),window.removeEventListener(`pointermove`,this._onPointerMove,!0),this._stopRoulette(!1);for(let e of this._timers)clearTimeout(e);this._timers.clear(),this._minimap.dispose(),this._screen=null,this.el.remove()}},Hf=Math.PI*2,Uf=(e,t,n)=>e<t?t:e>n?n:e,Wf=(e,t=0)=>{let n=typeof e==`boolean`?+!!e:e;return typeof n==`number`&&Number.isFinite(n)?n:t},Gf=e=>440*2**((e-69)/12);function Kf(e=1){let t=e*2654435761>>>0;return()=>{t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}var Q=class{constructor(e,t,n,r,i=0){this.type=e,this.sr=r,this.x1=this.x2=this.y1=this.y2=0,this.set(t,n,i)}set(e,t=this.q,n=this.g){this.q=t,this.g=n;let r=Hf*Uf(e,5,this.sr*.49)/this.sr,i=Math.cos(r),a=Math.sin(r)/(2*Math.max(1e-4,t)),o=10**(n/40),s,c,l,u,d,f;switch(this.type){case`lp`:s=(1-i)/2,c=1-i,l=s,u=1+a,d=-2*i,f=1-a;break;case`hp`:s=(1+i)/2,c=-(1+i),l=s,u=1+a,d=-2*i,f=1-a;break;case`bp`:s=a,c=0,l=-a,u=1+a,d=-2*i,f=1-a;break;case`peak`:s=1+a*o,c=-2*i,l=1-a*o,u=1+a/o,d=-2*i,f=1-a/o;break;default:throw Error(`Biquad: unknown type `+this.type)}return this.b0=s/u,this.b1=c/u,this.b2=l/u,this.a1=d/u,this.a2=f/u,this}process(e){let t=this.b0*e+this.b1*this.x1+this.b2*this.x2-this.a1*this.y1-this.a2*this.y2;return this.x2=this.x1,this.x1=e,this.y2=this.y1,this.y1=t,t}run(e){for(let t=0;t<e.length;t++)e[t]=this.process(e[t]);return e}};function qf(e,t,n=18){let r=Math.exp(-Hf*n/t),i=0,a=0;for(let t=0;t<e.length;t++){let n=e[t],o=n-i+r*a;i=n,a=o,e[t]=o}return e}function Jf(e,t,n){let r=Math.min(e.length,Math.floor(n*t)),i=e.length-r;for(let t=0;t<r;t++)e[i+t]*=1-t/r;return e}function Yf(...e){let t=0;for(let n of e)for(let e=0;e<n.length;e++){let r=Math.abs(n[e]);r>t&&(t=r)}return t}function Xf(e,t=.9){let n=Array.isArray(e)?e:[e],r=Yf(...n);if(r>1e-9&&Number.isFinite(r))for(let e of n)for(let n=0;n<e.length;n++)e[n]*=t/r;return e}function Zf(e){for(let t=0;t<e.length;t++)Number.isFinite(e[t])||(e[t]=0);return e}function Qf(e,t,{peak:n=.9,fade:r=.03,dc:i=!0}={}){return Zf(e),i&&qf(e,t),Jf(e,t,r),Xf(e,n)}function $f(e,t){let n=new Float32Array(e);for(let r=0;r<e;r++)n[r]=t()*2-1;return n}function ep(e,t){let n=new Float32Array(e),r=0,i=0,a=0;for(let o=0;o<e;o++){let e=t()*2-1;r=.99765*r+e*.099046,i=.963*i+e*.2965164,a=.57*a+e*1.0526913,n[o]=(r+i+a+e*.1848)*.22}return n}function tp(e,t){let n=new Float32Array(e),r=0;for(let i=0;i<e;i++)r=(r+(t()*2-1)*.04)*.998,n[i]=r*3;return n}function np(e,t,n=.25){let r=Math.floor(n*t);return e.map(e=>{let t=e.length-r,n=e.slice(0,t);for(let i=0;i<r;i++){let a=i/r;n[i]=e[t+i]*Math.cos(a*Math.PI*.5)+e[i]*Math.sin(a*Math.PI*.5)}return n})}var rp=new Map;function ip(e,t,n){let r=t+`:`+e,i=rp.get(r);if(!i){let e=n(t);i=ap(Array.isArray(e)?e:[e],t),rp.set(r,i)}return i}function ap(e,t){let n=Math.max(1,e[0].length),r=new AudioBuffer({length:n,numberOfChannels:e.length,sampleRate:t});return e.forEach((e,t)=>r.copyToChannel(e,t)),r}var op=e=>ip(`noise`,e,e=>$f(Math.floor(e*4),Kf(99))),sp=e=>ip(`pink`,e,e=>Xf(ep(Math.floor(e*4),Kf(98)),.8)),cp=e=>ip(`brown`,e,e=>Xf(qf(tp(Math.floor(e*4),Kf(97)),e,10),.8));function lp(e,t=1.8){let n=Math.floor(e*t),r=new Float32Array(n),i=new Float32Array(n),a=Kf(77),o=Math.floor(.012*e),s=0,c=0;for(let l=o;l<n;l++){let n=(l-o)/e,u=Math.exp(-6.9*n/(t*.8))*Math.min(1,n/.015),d=7500*Math.exp(-n*1.6)+900,f=Math.exp(-Hf*d/e);s=s*f+(a()*2-1)*(1-f),c=c*f+(a()*2-1)*(1-f),r[l]=s*u*2.2,i[l]=c*u*2.2}for(let[t,a,s]of[[.009,.55,.25],[.017,.4,.5],[.023,.32,.3],[.031,.28,.6],[.043,.22,.35],[.058,.16,.55]]){let c=o+Math.floor(t*e);c<n&&(r[c]+=a*(1-s),i[c+7<n?c+7:c]+=a*s)}return[r,i]}var up={master:.9,music:.55,sfx:.8},dp=.4,fp=.75,pp=.72;function mp(e=4096){let t=new Float32Array(e),n=.72,r=.22;for(let i=0;i<e;i++){let a=i/(e-1)*2-1,o=Math.abs(a),s=o<=n?o:n+r*Math.tanh((o-n)/r);t[i]=Math.sign(a)*s}return t}function hp(e,t=e.destination,n=up){let r=(t=1)=>{let n=e.createGain();return n.gain.value=t,n},i=r(n.master),a=e.createBiquadFilter();a.type=`highpass`,a.frequency.value=24,a.Q.value=.6;let o=e.createDynamicsCompressor();o.threshold.value=-14,o.knee.value=10,o.ratio.value=3.5,o.attack.value=.004,o.release.value=.2;let s=r(pp),c=e.createWaveShaper();c.curve=mp(),c.oversample=`none`,i.connect(a).connect(o).connect(s).connect(c).connect(t);let l=r(1),u=e.createConvolver();u.buffer=ip(`ir`,e.sampleRate,e=>lp(e));let d=r(.55);l.connect(u).connect(d).connect(i);let f=r(1),p=r(1);f.connect(i),p.connect(l);let m=(e,t,n)=>{let i={dry:r(e),wet:r(e)};return i.dry.connect(t),i.wet.connect(n),i},h=m(n.music,f,p),g=m(n.music,i,l),_=m(n.sfx,i,l),v=m(n.sfx*fp,i,l),y={...up,...n},b=(t,n)=>{t.cancelScheduledValues(e.currentTime),t.setTargetAtTime(n,e.currentTime,.04)};return{ctx:e,master:i,music:h,jingle:g,sfx:_,amb:v,comp:o,revIn:l,get volume(){return{...y}},setVolume(e={}){for(let t of[`master`,`music`,`sfx`])e[t]!==void 0&&(y[t]=Uf(Wf(e[t],y[t]),0,1));b(i.gain,y.master);for(let e of[h,g])b(e.dry.gain,y.music),b(e.wet.gain,y.music);b(_.dry.gain,y.sfx),b(_.wet.gain,y.sfx),b(v.dry.gain,y.sfx*fp),b(v.wet.gain,y.sfx*fp)},duck(t,n=e.currentTime){for(let e of[f.gain,p.gain])e.cancelScheduledValues(n),e.setTargetAtTime(t?dp:1,n,t?.05:.35)},dispose(){try{c.disconnect()}catch{}}}}function gp(e,t,n){let r=Math.floor(e*n.len),i=new Float32Array(r),a=e/t,o=n.damp,s=Hf*t/e,c=Math.sqrt((1-o)*(1-o)+o*o+2*o*(1-o)*Math.cos(s)),l=Math.min(.99995,10**(-3/(n.t60*t))/c),u=a-o,d=Kf(n.seed),f=Math.max(4,Math.floor(a*n.exLen)),p=new Float32Array(f),m=new Q(`lp`,n.exCut,.7,e);for(let e=0;e<f;e++)p[e]=m.process(d()*2-1)*(n.exShape?Math.sin(Math.PI*e/f):1);let h=Math.max(1,Math.round(a*n.pos));for(let e=f-1;e>=h;e--)p[e]-=p[e-h];let g=Yf(p)||1,_=n.t60*e/6.9,v=0;for(let t=0;t<r;t++){let r=n.bend?u*(1-n.bend*Math.exp(-t/(n.bendT*e))):u,a=t-r,s=0;if(a>=0){let e=a|0;s=i[e]+(i[e+1]-i[e])*(a-e)}let c=l*((1-o)*s+o*v);v=s;let d=(t<f?p[t]:0)+c;if(n.sawari){let e=g*n.sawari*Math.exp(-t/_);d>e&&(d=e+(d-e)*.3)}i[t]=d}return i}function _p(e,t){let n=Gf(t),r=Uf(1.6*(220/n)**.35,.5,2.2),i=gp(e,n,{len:Math.min(1.5,r*.85+.2),t60:r,damp:.22,exCut:9e3,exLen:1,pos:.13,sawari:.42,bend:.006,bendT:.035,seed:t*7+1}),a=Kf(t+500),o=new Q(`bp`,2600,1.4,e),s=Math.floor(.03*e);for(let t=0;t<s;t++){let n=t/e;i[t]+=o.process(a()*2-1)*Math.exp(-n/.006)*1.3+Math.sin(Hf*210*n)*Math.exp(-n/.012)*.45}return new Q(`hp`,140,.7,e).run(i),new Q(`peak`,1900,1.2,e,4).run(i),new Q(`lp`,7500,.7,e).run(i),Qf(i,e,{fade:.1})}function vp(e,t){let n=Gf(t),r=Uf(3*(220/n)**.4,1,4),i=gp(e,n,{len:Math.min(1.9,r*.6+.25),t60:r,damp:.36,exCut:4200,exLen:.7,exShape:!0,pos:.2,sawari:0,bend:.003,bendT:.05,seed:t*11+3}),a=Kf(t+900),o=new Q(`bp`,3200,1,e);for(let t=0;t<Math.floor(.012*e);t++){let n=t/e;i[t]+=o.process(a()*2-1)*Math.exp(-n/.003)*.5}return new Q(`hp`,90,.7,e).run(i),new Q(`peak`,320,1,e,3).run(i),new Q(`lp`,6e3,.7,e).run(i),Qf(i,e,{fade:.2})}function yp(e,t){let n=Gf(t),r=Uf(.9*(262/n)**.5,.25,1.4),i=Math.floor(e*Math.min(1,r+.1)),a=new Float32Array(i),o=Kf(t+1300),s=new Q(`lp`,2500,.7,e),c=[[1,1,1],[3.93,.22,.22],[9.2,.06,.08]].filter(t=>t[0]*n<e*.45);for(let t=0;t<i;t++){let i=t/e,l=0;for(let[e,t,a]of c)l+=t*Math.sin(Hf*n*e*i)*Math.exp(-6.9*i/(r*a));a[t]=l*Math.min(1,i/.0015)+(i<.006?s.process(o()*2-1)*Math.exp(-i/.0015)*.25:0)}return Qf(a,e,{fade:.05})}function bp(e,t){let n=Gf(t),r=Uf(2.2*(523/n)**.3,.8,3),i=Math.floor(e*Math.min(1.6,r*.7)),a=new Float32Array(i),o=[[1,1,1],[2.76,.28,.3],[5.4,.1,.12],[8.93,.04,.05]].filter(t=>t[0]*n<e*.45);for(let t=0;t<i;t++){let i=t/e,s=0;for(let[e,t,a]of o)s+=t*Math.sin(Hf*n*e*i)*Math.exp(-6.9*i/(r*a));a[t]=s*Math.min(1,i/7e-4)}return Qf(a,e,{fade:.1})}var xp={shamisen:_p,koto:vp,marimba:yp,glock:bp},Sp=Object.keys(xp);function Cp(e,t,n){let r=Uf(Math.round(t),24,108);return ip(e+`@`+r,n,t=>xp[e](t,r))}function wp(e,t,n){return Math.min(1,e/t)*Math.exp(-e/n)}function Tp(e){let t=Math.floor(e*1.3),n=new Float32Array(t),r=Kf(11),i=new Q(`lp`,1300,.7,e),a=new Q(`lp`,260,.7,e),o=0,s=0,c=0;for(let l=0;l<t;l++){let t=l/e,u=72+80*Math.exp(-t/.035);o+=Hf*u/e,s+=Hf*u*1.59/e,c+=Hf*u*2.14/e;let d=Math.sin(o)*Math.exp(-t/.42)+.4*Math.sin(s)*Math.exp(-t/.15)+.2*Math.sin(c)*Math.exp(-t/.07),f=r()*2-1,p=i.process(f)*Math.exp(-t/.016)*1.1+a.process(f)*Math.exp(-t/.2)*.9;n[l]=Math.tanh(1.5*(d*Math.min(1,t/.002)+p))}return Qf(n,e,{fade:.1})}function Ep(e){let t=Math.floor(e*.15),n=new Float32Array(t),r=Kf(12),i=new Q(`bp`,1900,2.5,e);for(let a=0;a<t;a++){let t=a/e;n[a]=i.process(r()*2-1)*Math.exp(-t/.012)*1.6+Math.sin(Hf*880*t)*Math.exp(-t/.018)*.6+Math.sin(Hf*1370*t)*Math.exp(-t/.01)*.3}return Qf(n,e)}function Dp(e){let t=Math.floor(e*.4),n=new Float32Array(t),r=Kf(13),i=new Q(`bp`,3e3,1.2,e),a=0;for(let o=0;o<t;o++){let t=o/e,s=380+150*Math.exp(-t/.008);a+=Hf*s/e;let c=Math.sin(a)*Math.exp(-t/.075)+.3*Math.sin(a*1.6)*Math.exp(-t/.04);n[o]=Math.tanh(1.3*(c+i.process(r()*2-1)*Math.exp(-t/.006)*1.4))}return Qf(n,e)}function Op(e,t,n,r,i,a,o){let s=Math.floor(e*t),c=new Float32Array(s),l=Kf(a),u=r.map(()=>l()*Hf),d=new Q(`hp`,3e3,.7,e);for(let t=0;t<s;t++){let a=t/e,s=0;r.forEach(([t,r,o],c)=>{let l=n*t;l<e*.45&&(s+=r*Math.sin(Hf*l*a+u[c])*Math.exp(-a/Math.min(o,i))+r*.5*Math.sin(Hf*l*1.0045*a)*Math.exp(-a/Math.min(o,i)))}),c[t]=s*Math.min(1,a/8e-4)+(a<.02?d.process(l()*2-1)*Math.exp(-a/.003)*o:0)}return new Q(`lp`,8e3,.7,e).run(c),Qf(c,e,{fade:.02})}var kp=[[1,1,.3],[2.37,.55,.2],[3.93,.35,.12],[5.72,.2,.08],[7.8,.1,.05]],Ap=e=>Op(e,.6,1180,kp,1,21,.6),jp=e=>Op(e,.12,1180,kp,.025,22,.8);function Mp(e,t=.5,n=.2,r=31){let i=Math.floor(e*t),a=new Float32Array(i),o=Kf(r),s=[2080,2970,3610,4430,5390,6710],c=s.map(()=>o()*Hf),l=new Q(`bp`,6e3,.7,e);for(let t=0;t<i;t++){let r=t/e,i=0;s.forEach((e,t)=>{i+=Math.sin(Hf*e*r+c[t]+2*Math.sin(Hf*310*r))/(t+1.5)}),a[t]=(i*Math.exp(-r/n)+l.process(o()*2-1)*Math.exp(-r/(n*.6))*.9)*Math.min(1,r/.001)}return new Q(`lp`,9e3,.7,e).run(a),Qf(a,e,{fade:.03})}function Np(e){let t=Math.floor(e*.5),n=new Float32Array(t),r=Kf(41),i=new Q(`lp`,4e3,.7,e),a=0;for(let o=0;o<t;o++){let t=o/e,s=48+110*Math.exp(-t/.03);a+=Hf*s/e,n[o]=Math.tanh(1.8*(Math.sin(a)*Math.exp(-t/.2)+(t<.004?i.process(r()*2-1)*.5:0)))}return Qf(n,e)}function Pp(e){let t=Math.floor(e*.35),n=new Float32Array(t),r=Kf(42),i=new Q(`bp`,2800,.6,e),a=new Q(`hp`,900,.7,e);for(let o=0;o<t;o++){let t=o/e,s=(Math.sin(Hf*185*t)+.5*Math.sin(Hf*330*t))*Math.exp(-t/.05);n[o]=s*.6+a.process(i.process(r()*2-1))*Math.exp(-t/.085)*2.2}return new Q(`lp`,9e3,.7,e).run(n),Qf(n,e)}function Fp(e){let t=Math.floor(e*.4),n=new Float32Array(t),r=Kf(43),i=new Q(`bp`,1300,1.3,e);for(let a=0;a<t;a++){let t=a/e,o=0;for(let e of[0,.011,.022])t>=e&&(o+=Math.exp(-(t-e)/.005));t>=.03&&(o+=Math.exp(-(t-.03)/.09)*.8),n[a]=i.process(r()*2-1)*o}return Qf(n,e)}function Ip(e,t,n,r){let i=Math.floor(e*t),a=new Float32Array(i),o=Kf(r),s=[205.3,304.4,369.6,522.7,540,800].map(e=>e*1.7),c=new Q(`bp`,7500,.9,e),l=new Q(`hp`,5200,.7,e);for(let t=0;t<i;t++){let r=t/e,i=0;for(let e of s)i+=Math.sin(Hf*e*r)>0?1:-1;a[t]=l.process(c.process(i*.3+(o()*2-1)*.8))*wp(r,5e-4,n)}return new Q(`lp`,10500,.7,e).run(a),Qf(a,e,{fade:.01})}function Lp(e,t=.14,n=.012,r=.04,i=4500,a=0,o=51){let s=Math.floor(e*t),c=new Float32Array(s),l=Kf(o),u=new Q(`bp`,i,1.4,e);for(let t=0;t<s;t++){let i=t/e,o=a?.55+.45*Math.sin(Hf*a*i):1;c[t]=u.process(l()*2-1)*wp(i,n,r)*o}return Qf(c,e,{fade:.02})}function Rp(e){let t=Math.floor(e*.3),n=new Float32Array(t),r=Kf(52),i=new Q(`lp`,5500,.7,e),a=new Q(`bp`,2600,.8,e);for(let o=0;o<t;o++){let t=o/e,s=r()*2-1;n[o]=i.process(s)*wp(t,.02,.09)*.6+a.process(s)*Math.exp(-t/.012)*1.2+Math.sin(Hf*190*t)*Math.exp(-t/.03)*.15}return Qf(n,e)}function zp(e){let t=Math.floor(e*2.2),n=new Float32Array(t),r=Kf(53),i=new Q(`hp`,500,.7,e),a=new Q(`lp`,7500,.7,e),o=$f(10,r).map(e=>900+(e+1)*2800);for(let s=0;s<t;s++){let t=s/e,c=0;for(let e=0;e<o.length;e++)c+=Math.sin(Hf*o[e]*t+e);n[s]=a.process(i.process(r()*2-1+c*.06))*wp(t,.002,.55)}return Qf(n,e,{fade:.2})}function Bp(e,t=900,n=54){let r=Math.floor(e*.18),i=new Float32Array(r),a=Kf(n),o=new Q(`bp`,2500,2,e);for(let n=0;n<r;n++){let r=n/e,s=t*(1+.08*Math.exp(-r/.004));i[n]=Math.sin(Hf*s*r)*Math.exp(-r/.035)+.35*Math.sin(Hf*s*2.64*r)*Math.exp(-r/.012)+o.process(a()*2-1)*Math.exp(-r/.002)*.6}return Qf(i,e)}function Vp(e){let t=Math.floor(e*.25),n=new Float32Array(t),r=Kf(55),i=new Q(`bp`,3200,3,e);for(let a=0;a<t;a++){let t=a/e;n[a]=Math.sin(Hf*2150*t)*Math.exp(-t/.05)+.6*Math.sin(Hf*3580*t)*Math.exp(-t/.03)+i.process(r()*2-1)*Math.exp(-t/.003)*1.5}return Qf(n,e)}function Hp(e,t){let n=0;for(;n<e.length-2&&t>e[n+1][0];)n++;let[r,i]=e[n],[a,o]=e[n+1],s=Uf((t-r)/Math.max(1e-6,a-r),0,1),c={};for(let e in i)c[e]=i[e]+(o[e]-i[e])*s;return c}function Up(e,t,n,r,i,a=1){let o=Math.floor(t*e),s=new Float32Array(o),c=Kf(i),l=[new Q(`bp`,500,5,e),new Q(`bp`,1e3,7,e),new Q(`bp`,2500,8,e)],u=new Q(`hp`,3800,.8,e),d=0,f=n[0][1];for(let t=0;t<o;t++){let i=t/e;t&31||(f=Hp(n,i),l[0].set(f.f1*a,5),l[1].set(f.f2*a,7),l[2].set(f.f3*a,8)),d+=r(i)/e,d>=1&&--d;let o=c()*2-1,p=(2*d-1)*f.v+o*(f.h+.12*f.v);s[t]=(l[0].process(p)+l[1].process(p)*.7+l[2].process(p)*.35+u.process(o)*f.s*.5)*f.a}return s}var Wp=(e,t,n,r,i,a,o)=>({f1:e,f2:t,f3:n,v:r,h:i,s:a,a:o});function Gp(e,t,n,r,i){let a=new Float32Array(Math.floor(t*e));return[[1,0,1],[.8,.013,.93],[1.22,.026,1.07]].forEach(([o,s,c],l)=>{let u=Up(e,t,n,e=>r(e)*o,i+l,c),d=Math.floor(s*e);for(let e=0;e+d<a.length;e++)a[e+d]+=u[e]*(l?.8:1)}),new Q(`lp`,5e3,.7,e).run(a),Qf(a,e,{fade:.06})}var Kp={taiko:Tp,taikoKa:Ep,shime:Dp,kane:Ap,kaneM:jp,chappa:e=>Mp(e,.5,.2,31),chappaM:e=>Mp(e,.12,.035,32),kick:Np,snare:Pp,clap:Fp,hat:e=>Ip(e,.12,.03,44),ohat:e=>Ip(e,.5,.2,45),shaker:e=>Lp(e),cicada:e=>Lp(e,.2,.02,.07,5200,62,56),brush:Rp,crash:zp,wood:e=>Bp(e),hyoshigi:Vp,soiya:e=>Gp(e,.56,[[0,Wp(500,900,2600,0,0,0,0)],[.01,Wp(500,900,2600,0,0,1,1)],[.06,Wp(500,900,2600,0,0,1,1)],[.08,Wp(500,850,2600,1,0,0,1)],[.16,Wp(480,880,2600,1,0,0,1)],[.2,Wp(320,2100,2900,1,0,0,.9)],[.26,Wp(290,2200,3e3,1,0,0,.8)],[.31,Wp(780,1250,2600,1,0,0,1)],[.44,Wp(760,1220,2600,1,.1,0,.9)],[.54,Wp(700,1150,2500,.3,.2,0,0)]],e=>e<.28?210+e*150:280-(e-.28)*120,61),hah:e=>Gp(e,.26,[[0,Wp(800,1250,2600,0,1,0,0)],[.012,Wp(800,1250,2600,0,1.2,0,1)],[.045,Wp(800,1250,2600,1,.3,0,1)],[.18,Wp(760,1200,2600,1,.2,0,.8)],[.25,Wp(700,1150,2500,.2,.2,0,0)]],e=>270-e*300,71)},qp=Object.keys(Kp);function Jp(e,t){let n=Kp[e];return n?ip(`smp:`+e,t,n):null}var Yp=new WeakMap,Xp={fue:[1,.42,.24,.12,.06,.03,.015],shaku:[1,.2,.09,.035,.012],bass:Array.from({length:28},(e,t)=>t===0?1:.55/(t+1))};function Zp(e,t){let n=Yp.get(e);if(n||(n={},Yp.set(e,n)),!n[t]){let r=Xp[t],i=new Float32Array(r.length+1),a=new Float32Array(r.length+1);r.forEach((e,t)=>{a[t+1]=e}),n[t]=e.createPeriodicWave(i,a)}return n[t]}var Qp=Kf(4242);function $p(e,t){e.onended=()=>{for(let e of t)try{e.disconnect()}catch{}}}function em(e,t,n,r,i=1,a=1,o={}){if(!n)return null;let s=e.createBufferSource();s.buffer=n,s.playbackRate.value=Uf(Wf(a,1),.05,8);let c=e.createGain();return c.gain.value=Uf(Wf(i,0),0,4),s.connect(c).connect(t),s.start(r,o.offset||0),$p(s,[s,c]),{src:s,g:c,stop(t){let n=Math.max(t,e.currentTime);c.gain.setTargetAtTime(0,n,.012);try{s.stop(n+.08)}catch{}}}}var tm={fue:{wave:`fue`,level:.8,att:.03,rel:.05,chiff:.5,breath:.07,vibHz:5.4,vib:.011,scoop:70,bpMul:2.4},shaku:{wave:`shaku`,level:.85,att:.06,rel:.09,chiff:.6,breath:.16,vibHz:4.6,vib:.014,scoop:120,bpMul:1.6}};function nm(e,t,n,r,i,a,o,s){let c=tm[s],l=Gf(r),u=n+i,d=e.createOscillator();d.setPeriodicWave(Zp(e,c.wave));let f=d.frequency;o.orn?(f.setValueAtTime(l*1.1225,n),f.setValueAtTime(l,n+.055)):i>.22&&!o.lg?(f.setValueAtTime(l*2**(-c.scoop/1200),n),f.exponentialRampToValueAtTime(l,n+.075)):f.setValueAtTime(l,n);let p=[d],m=null;if(i>.32){m=e.createOscillator(),m.frequency.value=c.vibHz;let t=e.createGain();t.gain.setValueAtTime(0,n),t.gain.setValueAtTime(0,n+.2),t.gain.linearRampToValueAtTime(l*c.vib*Math.min(1,i/1.1),u),m.connect(t).connect(f),m.start(n),p.push(m,t)}let h=a*c.level,g=o.lg?.012:c.att,_=e.createGain();_.gain.setValueAtTime(0,n),_.gain.linearRampToValueAtTime(h,n+g),_.gain.setTargetAtTime(h*.82,n+g,.35),_.gain.setTargetAtTime(0,u,c.rel),d.connect(_).connect(t);let v=e.createBufferSource();v.buffer=op(e.sampleRate),v.loop=!0;let y=e.createBiquadFilter();y.type=`bandpass`,y.frequency.value=Math.min(7e3,l*c.bpMul),y.Q.value=1.1;let b=e.createGain();b.gain.setValueAtTime(0,n),b.gain.linearRampToValueAtTime(h*c.chiff*(o.lg?.35:1),n+.012),b.gain.setTargetAtTime(h*c.breath,n+.02,.05),b.gain.setTargetAtTime(0,u,c.rel),v.connect(y).connect(b).connect(t);let x=u+c.rel*7;return d.start(n),v.start(n,Qp()*3),d.stop(x),v.stop(x),m&&m.stop(x),p.push(_,v,y,b),$p(d,p),{stop(t){let n=Math.max(t,e.currentTime);_.gain.cancelScheduledValues(n),_.gain.setTargetAtTime(0,n,.02),b.gain.cancelScheduledValues(n),b.gain.setTargetAtTime(0,n,.02)}}}function rm(e,t,n,r,i,a,o){let s=Gf(r),c=e.createOscillator();c.setPeriodicWave(Zp(e,`bass`)),c.frequency.value=s;let l=e.createBiquadFilter();l.type=`lowpass`,l.Q.value=2.2;let u=o.cut||300;l.frequency.setValueAtTime(u+1300*a,n),l.frequency.setTargetAtTime(u,n+.01,.08);let d=e.createGain(),f=a*.95,p=n+Math.max(.05,i);return d.gain.setValueAtTime(0,n),d.gain.linearRampToValueAtTime(f,n+.006),d.gain.setTargetAtTime(f*.78,n+.02,.2),d.gain.setTargetAtTime(0,p-.015,.02),c.connect(l).connect(d).connect(t),c.start(n),c.stop(p+.2),$p(c,[c,l,d]),{stop(e){d.gain.cancelScheduledValues(e),d.gain.setTargetAtTime(0,e,.015)}}}function im(e,t,n,r,i,a,o){let s=e.createBiquadFilter();s.type=`lowpass`,s.Q.value=o.q;let c=e.createGain(),l=n+Math.max(.05,i),u=a*o.level/Math.sqrt(r.length*2);o.fenv?(s.frequency.setValueAtTime(o.cut*.3,n),s.frequency.linearRampToValueAtTime(o.cut*(.6+.8*a),n+o.fenv),s.frequency.setTargetAtTime(o.cut*.8,n+o.fenv,.2)):s.frequency.value=o.cut,c.gain.setValueAtTime(0,n),c.gain.linearRampToValueAtTime(u,n+o.att),c.gain.setTargetAtTime(u*o.sus,n+o.att,.4),c.gain.setTargetAtTime(0,l,o.rel/3);let d=l+o.rel*2.2,f=[];for(let t of r)for(let r of o.det){let i=e.createOscillator();i.type=`sawtooth`,i.frequency.value=Gf(t),i.detune.value=r+(Qp()-.5)*4,i.connect(s),i.start(n),i.stop(d),f.push(i)}return s.connect(c).connect(t),$p(f[0],[...f,s,c]),{stop(e){c.gain.cancelScheduledValues(e),c.gain.setTargetAtTime(0,e,.05)}}}var am={level:.55,q:.4,cut:1500,att:.35,sus:.9,rel:.7,det:[-9,8]},om={level:.6,q:.6,cut:2600,att:.14,sus:.85,rel:.35,det:[-7,6]},sm={level:.7,q:1.6,cut:2600,att:.02,sus:.8,rel:.12,det:[-6,5],fenv:.05};[...Sp];function cm(e,t,n,r,i,a,o,s={}){let c=Array.isArray(i)?i:[i];if(o=Uf(Wf(o,.8),0,1.5),a=Uf(Wf(a,.2),.02,30),r=Math.max(Wf(r,0),e.currentTime),Sp.includes(n)){let i=c.map((i,a)=>em(e,t,Cp(n,i,e.sampleRate),r+a*(s.strum||0),o*(a?.85:1)));return{stop(e){for(let t of i)t&&t.stop(e)}}}switch(n){case`flute`:return nm(e,t,r,c[0],a,o,s,`fue`);case`shaku`:return nm(e,t,r,c[0],a,o,s,`shaku`);case`bass`:return rm(e,t,r,c[0],a,o,s);case`pad`:return im(e,t,r,c,a,o,am);case`strings`:return im(e,t,r,c,a,o,om);case`brass`:return im(e,t,r,c,a,o,sm);default:return null}}function lm(e,t,n,r,i=1,a=1){return em(e,t,Jp(n,e.sampleRate),Math.max(Wf(r,0),e.currentTime),i,a)}var um={C:0,D:2,E:4,F:5,G:7,A:9,B:11},dm=e=>e===`#`?1:e===`b`?-1:0;function fm(e){if(e[0]===`n`)return Number(e.slice(1));let t=/^([A-G])(#|b)?(-?\d)$/.exec(e);return t?12*(Number(t[3])+1)+um[t[1]]+dm(t[2]):NaN}var pm={"":[0,4,7],m:[0,3,7],7:[0,4,7,10],m7:[0,3,7,10],maj7:[0,4,7,11],sus4:[0,5,7],sus2:[0,2,7],"7sus4":[0,5,7,10],add9:[0,4,7,14],6:[0,4,7,9],m6:[0,3,7,9],dim:[0,3,6],9:[0,4,7,10,14],m9:[0,3,7,10,14],madd9:[0,3,7,14],maj9:[0,4,7,11,14]};function mm(e){let[t,n]=e.split(`/`),r=/^([A-G])(#|b)?(.*)$/.exec(t);if(!r||!pm[r[3]])throw Error(`bad chord `+e);let i=(um[r[1]]+dm(r[2])+12)%12,a=i;if(n){let e=/^([A-G])(#|b)?$/.exec(n);a=(um[e[1]]+dm(e[2])+12)%12}return{sym:e,root:i,ints:pm[r[3]],bass:a}}function hm(e,t,n,r){let i=String(e).trim(),a=t,o=/^(\d+)\|/.exec(i);o&&(a=Number(o[1]),i=i.slice(o[0].length));let s=i.split(/\s+/).filter(Boolean);s.length!==a&&n&&n.push(`${r}: ${s.length} tokens (expected ${a})`);let c=t/a,l=Array(t).fill(`.`);return s.forEach((e,n)=>{let r=Math.round(n*c);if(!(r>=t)){l[r]=e;for(let n=1;n<c;n++)r+n<t&&(l[r+n]=e===`.`?`.`:`-`)}}),l}function gm(e,t,n,r,i,a){let o=null;e.forEach((e,s)=>{if(e===`-`){o&&o.l++;return}if(e===`.`){o=null;return}let c=/^([^!?*]+)([!?*]*)$/.exec(e),l=c?c[1].split(`+`).map(fm):[NaN];if(l.some(e=>!Number.isFinite(e))){i.push(`${a}: bad token '${e}'`),o=null;return}let u=c[2],d=n;u.includes(`!`)&&(d=Math.min(1,n*1.25)),u.includes(`?`)&&(d=n*.55),o={c:t,s,m:l.length>1?l:l[0],l:1,v:d,o:u.includes(`*`),lg:o!==null},r.push(o)})}var _m={x:.8,X:1,o:.45};function vm(e,t,n,r,i,a,o){for(let s in e){let c=String(e[s]).replace(/\s+/g,``),l=i,u=/^(\d+)\|/.exec(c);u&&(l=Number(u[1]),c=c.slice(u[0].length)),c.length!==l&&a.push(`${o}/${s}: ${c.length} steps (expected ${l})`);let d=i/l;for(let e=0;e<c.length;e++){let a=c[e],o=_m[a]??(a>=`1`&&a<=`9`?Number(a)/9:0);o>0&&r.push({c:n,s:t.i*i+Math.round(e*d),d:s,v:o})}}}var ym=(e,t)=>t+((e-t)%12+12)%12;function bm(e,t,n,r){let i=ym(t.root,n),a=t.ints.find(e=>e>=2&&e<=5)??4,o=t.ints.find(e=>e>=6&&e<=8)??7,s=t.ints.find(e=>e>=9&&e<=11)??12,c=r?ym(r.root,n):i;switch(e){case`R`:return i;case`B`:return ym(t.bass,n);case`2`:return i+2;case`3`:return i+a;case`5`:return i+o;case`6`:return i+9;case`7`:return i+s;case`8`:return i+12;case`9`:return i+14;case`10`:return i+12+a;case`12`:return i+12+o;case`14`:return i+12+s;case`15`:return i+24;case`L5`:return i+o-12;case`L3`:return i+a-12;case`L7`:return i+s-12;case`A`:return c-1;case`W`:return c+2;case`V`:return c+7-(c+7-i>9?12:0);default:return fm(e)}}function $(e,t){return n=>hm(e,n.len).map((e,r)=>{if(e===`.`||e===`-`)return e;let i=r<n.len/2||!n.chords[1]?n.chords[0]:n.chords[1],a=/^([^!?*]+)([!?*]*)$/.exec(e);return a[1].split(`+`).map(e=>`n`+bm(e,i,t,n.next)).join(`+`)+a[2]}).join(` `)}function xm(e,t,n,r){let i=[...new Set(e.ints.map(t=>(e.root+t)%12))];for(;i.length>r;)i.splice(2,1);let a=[];for(let e=0;e<i.length;e++){let t=i.slice(e).concat(i.slice(0,e)),r=[],o=n-1;for(let e of t){let t=o+1;for(;(t%12+12)%12!==e;)t++;r.push(t),o=t}a.push(r)}let o=e=>e.reduce((e,t)=>e+t,0)/e.length,s=(e,t)=>Math.min(...t.map(t=>Math.abs(e-t))),c=t?e=>e.reduce((e,n)=>e+s(n,t),0)+t.reduce((t,n)=>t+s(n,e),0)+Math.abs(o(e)-(n+8))*.3:e=>Math.abs(o(e)-(n+8));return a.sort((e,t)=>c(e)-c(t))[0]}function Sm(e=55,t=4){let n=null;return r=>{let i=r.chords.map(r=>n=xm(r,n,e,t)),a=e=>e.map(e=>`n`+e).join(`+`);return i.length===1?`1| `+a(i[0]):`2| `+i.map(a).join(` `)}}var Cm={k:{s:`kick`,vol:.62,pan:0,rev:.03},s:{s:`snare`,vol:.34,pan:.04,rev:.16},c:{s:`clap`,vol:.26,pan:-.05,rev:.2},h:{s:`hat`,vol:.2,pan:.28,rev:.04},oh:{s:`ohat`,vol:.17,pan:.28,rev:.08},sk:{s:`shaker`,vol:.19,pan:-.32,rev:.06},ci:{s:`cicada`,vol:.16,pan:.36,rev:.1},br:{s:`brush`,vol:.3,pan:.08,rev:.14},cr:{s:`crash`,vol:.17,pan:-.22,rev:.18},don:{s:`taiko`,vol:.6,pan:0,rev:.32},ka:{s:`taikoKa`,vol:.26,pan:.12,rev:.16},sh:{s:`shime`,vol:.26,pan:.22,rev:.1},kn:{s:`kane`,vol:.13,pan:-.3,rev:.12},km:{s:`kaneM`,vol:.13,pan:-.3,rev:.05},cp:{s:`chappa`,vol:.11,pan:.34,rev:.12},cpm:{s:`chappaM`,vol:.11,pan:.34,rev:.05},wb:{s:`wood`,vol:.2,pan:-.18,rev:.12},hy:{s:`hyoshigi`,vol:.22,pan:.2,rev:.25},sy:{s:`soiya`,vol:.34,pan:0,rev:.28},ha:{s:`hah`,vol:.3,pan:0,rev:.28}},wm=(e,t)=>Array.isArray(e)?e[t.i]??null:e,Tm=(e,t)=>Array.isArray(e)?e.map(e=>e+t):e+t;function Em(e){let t=e.len||16,n=[],r=Object.keys(e.ch),i=r.map(t=>({name:t,vel:.8,...e.ch[t]})),a=Object.fromEntries(r.map((e,t)=>[e,t])),o=e.form||{intro:e.sec.intro?[`intro`]:[],loop:[`A`,`B`]},s={},c=t=>e.sec[t].chords.trim().split(/\s+/).map(e=>e.split(`_`).map(mm)),l=[...o.intro,...o.loop],u=e=>{let t=l.indexOf(e);return t<l.length-1?l[t+1]:o.loop.length?o.loop[0]:e};for(let r of new Set(l)){let o=e.sec[r],l=c(r),d=c(u(r))[0][0],f=l.map((e,n)=>({i:n,len:t,chords:e,next:l[n+1]?l[n+1][0]:d,sec:r})),p=[];i.forEach((i,a)=>{if(i.copy)return;let s=o.parts[i.name];if(s==null)return;let c=`${e.id}/${r}/${i.name}`;if(i.kit)for(let e of f){let r=wm(s,e);typeof r==`function`&&(r=r(e)),r&&vm(r,e,a,p,t,n,c+`/`+e.i)}else{let e=[];for(let r of f){let i=wm(s,r);typeof i==`function`&&(i=i(r)),e.push(...i?hm(i,t,n,c+`/`+r.i):Array(t).fill(`.`))}gm(e,a,i.vel,p,n,c)}}),i.forEach((e,t)=>{if(!(!e.copy||e.secs&&!e.secs.includes(r)))for(let n of p.filter(t=>t.c===a[e.copy]))p.push({...n,c:t,m:Tm(n.m,e.tr||0),v:n.v*(e.vmul??1)})}),s[r]={nb:f.length,evs:p}}let d=new Set,f=e=>{let n=[];for(let r of e){let e=s[r],a=Array.from({length:e.nb},()=>({len:t,steps:Array(t)}));for(let n of e.evs){let e=a[Math.floor(n.s/t)];if(!e)continue;(e.steps[n.s%t]||=[]).push(n);let r=i[n.c];if(!r.kit&&Sp.includes(r.inst))for(let e of[].concat(n.m))d.add(r.inst+`:`+e)}n.push(...a)}return n},p=f(o.intro),m=f(o.loop),h=15/e.bpm;return{id:e.id,bpm:e.bpm,swing:e.swing||0,gain:e.gain??1,len:t,channels:i,kit:e.kit||{},intro:p,loop:m,warnings:n,notesUsed:[...d].map(e=>{let[t,n]=e.split(`:`);return[t,Number(n)]}),introSec:p.length*t*h,loopSec:m.length*t*h,endSec:(o.loop.length?(p.length+m.length)*t:Dm(p,t))*h}}function Dm(e,t){let n=0;return e.forEach((e,r)=>e.steps.forEach((e,i)=>e&&e.forEach(e=>{n=Math.max(n,r*t+i+(e.l||2))}))),n}var Om=e=>typeof OfflineAudioContext<`u`&&e instanceof OfflineAudioContext,km=class{constructor(e,t,n,{loop:r=!0,onEnd:i=null,solo:a=null,seed:o=7}={}){this.ctx=e,this.song=n,this.loopOn=r,this.onEnd=i,this.solo=a,this.rand=Kf(o),this.tempo=1,this.pendingTempo=null,this.final=!1,this.pendingFinal=null,this.out=e.createGain(),this.out.gain.value=0,this.out.connect(t.dry),this.send=e.createGain(),this.send.gain.value=0,this.send.connect(t.wet),this.strips=new Map,this.last=new Map,this.running=!1,this.stopped=!1,this.timer=0,this._tick=this._tick.bind(this)}_strip(e,t){let n=this.strips.get(e);if(!n){let r=this.ctx,i=r.createGain();i.gain.value=t.vol??.5;let a=[i],o=i;if(t.lp){let e=r.createBiquadFilter();e.type=`lowpass`,e.frequency.value=t.lp,e.Q.value=.5,o.connect(e),o=e,a.push(e)}let s=r.createStereoPanner();if(s.pan.value=Uf(t.pan??0,-1,1),o.connect(s).connect(this.out),a.push(s),t.rev){let e=r.createGain();e.gain.value=t.rev,o.connect(e).connect(this.send),a.push(e)}n={inp:i,nodes:a},this.strips.set(e,n)}return n.inp}start(e=this.ctx.currentTime+.05,t=0){let n=this.ctx;e=Math.max(e,n.currentTime);let r=this.song.gain;for(let n of[this.out.gain,this.send.gain])n.setValueAtTime(t>0?0:r,e),t>0&&n.linearRampToValueAtTime(r,e+t);return this.t0=e,this.nextTime=e,this.phase=this.song.intro.length?`intro`:`loop`,this.bar=0,this.step=0,this.pass=0,this.running=!0,Om(n)?this.scheduleUntil(n.length/n.sampleRate):this._tick(),this}setFinal(e){this.pendingTempo=e?1.12:1,this.pendingFinal=!!e}setRate(e){this.pendingTempo=null,this.tempo=Uf(e,.25,4)}stop(e=.5){if(this.stopped)return;this.stopped=!0,this.running=!1,clearTimeout(this.timer);let t=this.ctx.currentTime;e=Math.max(.02,e);for(let n of[this.out.gain,this.send.gain])n.cancelScheduledValues(t),n.setValueAtTime(n.value,t),n.linearRampToValueAtTime(0,t+e);setTimeout(()=>this.dispose(),(e+.3)*1e3)}dispose(){this.running=!1,clearTimeout(this.timer);for(let e of this.strips.values())for(let t of e.nodes)t.disconnect();this.strips.clear();try{this.out.disconnect(),this.send.disconnect()}catch{}}_tick(){if(!this.running)return;let e=typeof document<`u`&&document.hidden;this.scheduleUntil(this.ctx.currentTime+(e?1.5:.13)),this.running&&(this.timer=setTimeout(this._tick,25))}scheduleUntil(e){let t=this.ctx;if(!Om(t)&&this.nextTime<t.currentTime-.2){let e=0;for(;this.running&&this.nextTime<t.currentTime&&e++<1e5;)this._advance()}let n=0;for(;this.running&&this.nextTime<e&&n++<2e4;){let e=this._bars()[this.bar];if(!e){this._finish();break}let t=e.steps[this.step];if(t)for(let e of t)this._play(e,this.nextTime);this._advance()}}_bars(){return this.phase===`intro`?this.song.intro:this.song.loop}_advance(){let e=15/(this.song.bpm*this.tempo),t=this.song.swing;this.nextTime+=(this.step%2==0?1+t:1-t)*e;let n=this._bars()[this.bar];n&&++this.step>=n.len&&(this.step=0,this.bar++,this.bar>=this._bars().length&&this.loopOn&&this.song.loop.length&&(this.phase===`intro`?this.phase=`loop`:this.pass++,this.bar=0),this.pendingTempo!=null&&(this.tempo=this.pendingTempo,this.pendingTempo=null),this.pendingFinal!=null&&(this.final=this.pendingFinal,this.pendingFinal=null))}_finish(){this.running=!1,clearTimeout(this.timer),this.onEnd&&this.onEnd(this.nextTime)}_on(e){let t=this.phase===`loop`&&this.pass%2==1;switch(e.when){case`odd`:return t;case`even`:return!t;case`final`:return this.final;case`notfinal`:return!this.final;case`oddfinal`:return t||this.final;default:return!0}}_play(e,t){let n=this.song.channels[e.c];if(this.solo&&n.name!==this.solo||!this._on(n))return;let r=this.ctx;if(n.kit){let i=Cm[e.d];if(!i)return;let a=this._strip(`kit:`+e.d,{...i,...this.song.kit[e.d]||{}}),o=1+(this.rand()-.5)*.12,s=1+(this.rand()-.5)*.02;lm(r,a,i.s,t,e.v*o*(n.vol??1),((this.song.kit[e.d]||{}).rate||1)*s);return}let i=15/(this.song.bpm*this.tempo),a=this._strip(n.name,n),o=n.human===!1?0:(this.rand()-.5)*.006,s=e.v*(1+(this.rand()-.5)*.1),c=n.inst===`flute`||n.inst===`shaku`||n.inst===`strings`,l=e.l*i*(n.legato??(c?1:.94));if(n.choke){let n=this.last.get(e.c);n&&n.stop(t+o)}let u=cm(r,a,n.inst,t+o,e.m,l,s,{orn:e.o,lg:e.lg,strum:n.strum,cut:n.cut});n.choke&&u&&this.last.set(e.c,u)}},Am={in1:{don:`X.......X...X.X.`,sh:`1122334455667789`},in2:{k:`X.....x.X.......`,don:`X.....x.X.......`,s:`....X.......X.XX`,c:`....x.......x...`,h:`x.x.x.x.x.x.....`,cr:`X...............`},a:{k:`X.....x.X.......`,s:`....X.......X...`,c:`....x.......x...`,h:`x.x.x.x.x.x.x.xo`,don:`X.......X.......`},a1:{k:`X.....x.X.......`,s:`....X.......X...`,c:`....x.......x...`,h:`x.x.x.x.x.x.x.xo`,don:`X.......X.......`,cr:`X...............`},a4:{k:`X.....x.X.......`,s:`....X.......X.xx`,c:`....x.......x...`,h:`x.x.x.x.x.x.....`,don:`X.......X.X.X.XX`,ka:`..x...x.........`},a8:{k:`X.....x.X.......`,s:`....X...xxxxXXXX`,h:`x.x.x.x.........`,don:`X.......X.X.XXXX`},b1:{k:`X.....x.X.....x.`,s:`....X.......X...`,c:`....x.......x...`,oh:`..x...x...x...x.`,don:`X...............`,cr:`X...............`,sh:`o.ox..ox..oxo.ox`},b:{k:`X.....x.X.....x.`,s:`....X.......X...`,c:`....x.......x...`,oh:`..x...x...x...x.`,sh:`o.ox..ox..oxo.ox`,ka:`..............x.`},b4:{k:`X.....x.X.......`,s:`....X.......XxXX`,c:`....x.......x...`,oh:`..x...x.........`,don:`........X.X.X.X.`,sh:`o.ox..ox........`},b8:{k:`X.....x.X.......`,s:`....X...X.X.XXXX`,don:`X.......XXX.XXXX`,cr:`............X...`},fin:{sh:`xoxoxoxoxoxoxoxo`,kn:`..x...x...x...x.`}},jm=$(`8| R! R 8 R R! R 8 R`,38),Mm=$(`8| R! R 8 R 5 5 A A`,38),Nm={id:`title`,bpm:132,gain:1,ch:{lead:{inst:`flute`,vol:.69,pan:.06,rev:.26,lp:7e3},bell:{inst:`glock`,vol:.27,pan:.3,rev:.32,copy:`lead`,secs:[`B`],when:`odd`},sham:{inst:`shamisen`,vol:.9,pan:-.28,rev:.12,choke:!0,strum:.008},koto:{inst:`koto`,vol:.7,pan:.32,rev:.28},bass:{inst:`bass`,vol:.34},pad:{inst:`strings`,vol:.4,pan:-.1,rev:.35},padA:{inst:`strings`,vol:.32,pan:-.1,rev:.35,when:`odd`},brass:{inst:`brass`,vol:.47,pan:.12,rev:.2},dr:{kit:!0,vol:.55},drF:{kit:!0,vol:1.3,when:`final`}},sec:{intro:{chords:`D D`,parts:{sham:[`D4! . A4 D5 . A4 E5 . D5! . A4 B4 . A4 F#4 A4`,`D4! . A4 D5 . A4 E5 . D5! . A4 B4 . A4 F#4 A4`],lead:[`. . . . . . . . . . . . . . . .`,`A5 - - - - - - - B5 - A5 - F#5 - E5 -`],brass:[null,`D4+F#4+A4+D5! - - - . . . . . . . . . . . .`],bass:[`D2 - - - - - - - - - - - - - - -`,jm],dr:[Am.in1,Am.in2]}},A:{chords:`D D G A Bm G A D`,parts:{lead:[`F#5 - A5 - B5! - - - A5 - F#5 - E5 - - -`,`D5 - E5 - F#5 - - - - - - - . . A4 -`,`B4 - D5 - E5! - - - D5 - B4 - A4 - - -`,`B4 - - - A4 - - - E5 - - - - - . .`,`F#5 - A5 - B5! - - - D6 - B5 - A5 - - -`,`B5 - A5 - B5 - - - - - - - . . D6 -`,`E6!* - - - D6 - B5 - A5 - - - B5 - A5 -`,`D6 - - - - - - - - - - - . . . .`],sham:$(`R! . 5 . 8 . 5 R R! . 5 . 8 . 5 .`,52),bass:[jm,jm,jm,Mm,jm,jm,jm,Mm],padA:Sm(57,4),brass:[$(`R+3+5+8! - - - . . . . . . . . . . . .`,57)],dr:[Am.a1,Am.a,Am.a,Am.a4,Am.a,Am.a,Am.a,Am.a8],drF:Am.fin}},B:{chords:`G A F#m Bm G A D A`,parts:{lead:[`D6!* - - - B5 - - - A5 - B5 - - - D6 -`,`E6 - - - - - - - D6 - B5 - A5 - - -`,`A5 - - - F#5 - - - E5 - F#5 - - - A5 -`,`B5 - - - - - - - - - - - A5 - B5 -`,`D6!* - - - B5 - - - A5 - B5 - - - D6 -`,`E6 - - - - - - - F#6 - E6 - D6 - E6 -`,`F#6! - - - - - - - E6 - D6 - B5 - A5 -`,`B5 - - - A5 - - - - - - - . . . .`],sham:$(`8| . R+5 . R+5! . R+5 . R+5`,52),koto:$(`8| R 5 8 10 12 10 8 5`,55),bass:[$(`R! - - R - - R - R! - - R - - 8 -`,38),$(`R! - - R - - R - R! - - R - - 8 -`,38),$(`R! - - R - - R - R! - - R - - 8 -`,38),$(`8| R! R 8 R 5 5 A A`,38),$(`R! - - R - - R - R! - - R - - 8 -`,38),$(`R! - - R - - R - R! - - R - - 8 -`,38),$(`R! - - R - - R - R! - - R - - 8 -`,38),$(`8| R! R 8 R 5 5 A A`,38)],pad:Sm(57,4),brass:[$(`R+3+5! - - - . . . . . . . . . . . .`,57),null,null,null,$(`R+3+5! - - - . . . . . . . . . . . .`,57)],dr:[Am.b1,Am.b,Am.b,Am.b4,Am.b1,Am.b,Am.b,Am.b8],drF:Am.fin}}}},Pm={a:{k:`x.......x.......`,wb:`....x.......x...`,sk:`x.x.x.x.x.x.x.x.`},a4:{k:`x.......x.......`,wb:`....x.......x.x.`,sk:`x.x.x.x.x.xxxxxx`},b:{k:`x.......x.......`,wb:`....x.......x...`,sk:`x.x.x.x.x.x.x.x.`,hy:`..............o.`},b8:{k:`x.......x...x...`,wb:`....x...x.x.x.x.`,sk:`x.x.x.x.xxxxxxxx`}},Fm=$(`R - - - - - 5 - 8 - - - 5 - - -`,33),Im={id:`select`,bpm:108,gain:1.45,kit:{k:{vol:.42}},ch:{mar:{inst:`marimba`,vol:.96,pan:-.12,rev:.22},koto:{inst:`koto`,vol:.69,pan:.26,rev:.3},kotoM:{inst:`koto`,vol:1.55,pan:.12,rev:.3},marA:{inst:`marimba`,vol:.43,pan:-.28,rev:.2},shaku:{inst:`shaku`,vol:.24,pan:.05,rev:.42,when:`odd`},bass:{inst:`bass`,vol:.29,cut:220},pad:{inst:`pad`,vol:.34,rev:.42},bell:{inst:`glock`,vol:.3,pan:.35,rev:.45},dr:{kit:!0,vol:.85}},sec:{intro:{chords:`Fmaj7`,parts:{koto:$(`8| R 5 8 . 10 . 8 5`,53),bell:[`8| . . . . . C6 D6 F6`],dr:[{sk:`x.x.x.x.x.x.x.x.`}]}},A:{chords:`Fmaj7 Am7 Bbmaj7 C7sus4 Fmaj7 Am7 Gm7 C7sus4_C7`,parts:{mar:[`8| C5 D5 F5 . D5 C5 A4 .`,`8| C5 . . . . . G4 A4`,`8| C5 D5 F5 . G5 F5 D5 .`,`8| F5 . . . . . D5 C5`,`8| C5 D5 F5 . D5 C5 A4 .`,`8| C5 . . . . . D5 F5`,`8| G5 . F5 D5 C5 . D5 .`,`8| F5 . . . . . . .`],koto:$(`8| R 5 8 . 10 . 8 5`,53),bass:Fm,pad:Sm(55,4),bell:[null,null,null,`8| . . . . . C6 D6 F6`,null,null,null,`8| . . . . . F6 G6 A6`],dr:[Pm.a,Pm.a,Pm.a,Pm.a4,Pm.a,Pm.a,Pm.a,Pm.a4]}},B:{chords:`Bbmaj7 C Dm7 Am7 Gm7 C Fmaj7_Dm7 Gm7_C7`,parts:{kotoM:[`8| D5 - F5 - G5 - F5 D5`,`8| C5 - - - . . D5 F5`,`8| G5 - F5 - D5 - C5 -`,`8| D5 - - - . . . .`,`8| D5 - F5 - G5 - A5 -`,`8| G5 - - - A5 - D5 -`,`8| C5 - A4 - C5 - D5 -`,`8| C5 - - - . . . .`],marA:$(`8| . 5 8 10 . 8 5 .`,55),shaku:[`1| F4`,`1| G4`,`1| F4`,`1| E4`,`1| D4`,`1| E4`,`2| C4 D4`,`2| D4 E4`],bass:Fm,pad:Sm(55,4),dr:[Pm.b,Pm.b,Pm.b,Pm.a4,Pm.b,Pm.b,Pm.b,Pm.b8]}}}},Lm={a:{k:`x.......x.......`,br:`....x.......x...`,sk:`x.x.x.x.x.x.x.x.`},a4:{k:`x.......x.......`,br:`....x.......x.x.`,sk:`x.x.x.x.x.x.x.x.`,wb:`............x.x.`}},Rm={id:`results`,bpm:100,gain:1.2,kit:{k:{vol:.4},br:{vol:.24}},ch:{lead:{inst:`shaku`,vol:.6,pan:.05,rev:.4},kotoM:{inst:`koto`,vol:1.64,pan:-.08,rev:.32},koto:{inst:`koto`,vol:.58,pan:.3,rev:.32},mar:{inst:`marimba`,vol:.28,pan:-.3,rev:.25},bass:{inst:`bass`,vol:.3,cut:230},pad:{inst:`pad`,vol:.41,rev:.45},bell:{inst:`glock`,vol:.3,pan:.32,rev:.45},dr:{kit:!0,vol:.8}},sec:{intro:{chords:`Bbmaj7`,parts:{koto:$(`8| R 5 8 10 12 10 8 5`,50),pad:Sm(55,4),bell:[`8| . . . . F6 G6 Bb6 .`]}},A:{chords:`Bbmaj7 Cm7 Dm7 Ebmaj7 Bbmaj7 Gm7 Cm7 F7sus4`,parts:{lead:[`8| D5 - F5 - G5 - F5 D5`,`8| C5 - - - - - D5 F5`,`8| F5 - - - D5 - C5 -`,`8| Bb4 - - - - - . .`,`8| D5 - F5 - G5 - Bb5 -`,`8| G5 - F5 - D5 - - -`,`8| C5 - D5 - F5 - G5 -`,`8| F5 - - - - - . .`],koto:$(`8| R 5 8 10 12 10 8 5`,50),mar:$(`4| . 3+5+8 . 3+5+8`,58),bass:$(`R - - - - - - 5 R - - - - - 8 -`,34),pad:Sm(55,4),bell:[null,null,null,`8| . . . . . D6 F6 G6`,null,null,null,`8| . . . . . F6 G6 Bb6`],dr:[Lm.a,Lm.a,Lm.a,Lm.a4,Lm.a,Lm.a,Lm.a,Lm.a4]}},B:{chords:`Ebmaj7 F Dm7 Gm7 Cm7 F Bbmaj7 F7sus4`,parts:{kotoM:[`8| G5 - - - F5 - G5 Bb5`,`8| C6 - - - D6 - C6 -`,`8| F5 - - - D5 - F5 G5`,`8| G5 - - - - - . .`,`8| G5 - F5 - D5 - C5 -`,`8| C5 - D5 - F5 - - -`,`8| D5 - - - C5 - Bb4 -`,`8| C5 - - - - - . .`],koto:$(`8| R 5 8 10 12 10 8 5`,50),mar:$(`4| . 3+5+8 . 3+5+8`,58),bass:$(`R - - - - - - 5 R - - - - - 8 -`,34),pad:Sm(55,4),dr:[Lm.a,Lm.a,Lm.a,Lm.a4,Lm.a,Lm.a,Lm.a,Lm.a4]}}}},zm={in1:{br:`....x.......x...`,ci:`xoxoxoxoxoxoxoxo`},in2:{k:`x.......x.......`,br:`....x.......x.xx`,ci:`xoxoxoxoxoxoxoxo`,don:`............x.x.`},a:{k:`x.......x.......`,br:`....x.......x...`,ci:`xoxoxoxoxoxoxoxo`},a1:{k:`x.......x.......`,br:`....x.......x...`,ci:`xoxoxoxoxoxoxoxo`,cr:`x...............`},a4:{k:`x.......x.......`,br:`....x.......x.xx`,ci:`xoxoxoxoxoxo....`,don:`........x...x.x.`},a8:{k:`x.......x...x...`,s:`........o.o.xxXX`,br:`....x...........`,ci:`xoxoxoxo........`,don:`x.......x.x.x.x.`},b:{k:`x.......x.......`,s:`....x.......x...`,br:`....o.......o...`,ci:`xoxoxoxoxoxoxoxo`,sh:`..x...x...x...x.`},b1:{k:`x.......x.......`,s:`....x.......x...`,ci:`xoxoxoxoxoxoxoxo`,sh:`..x...x...x...x.`,cr:`X...............`,don:`x...............`},b4:{k:`x.......x.......`,s:`....x.......x.xx`,ci:`xoxoxoxoxoxo....`,sh:`..x...x...xxxxxx`},b8:{k:`x.......x.......`,s:`....x...x.x.XXXX`,ci:`xoxoxoxo........`,don:`x.......x.x.xxXX`},fin:{sh:`o.xoo.xoo.xoo.xo`,h:`..x...x...x...x.`}},Bm=$(`R - . . L5 - . . R - . . L5 - . A?`,38),Vm=$(`R - . . L5 - . . R - . . 3 - . .`,38),Hm={id:`inaka`,bpm:150,swing:.12,gain:1,kit:{k:{vol:.5}},ch:{lead:{inst:`flute`,vol:.8,pan:.05,rev:.25,lp:6500},sham:{inst:`shamisen`,vol:.78,pan:-.3,rev:.12,choke:!0,strum:.009},koto:{inst:`koto`,vol:.58,pan:.32,rev:.28,when:`odd`},bass:{inst:`bass`,vol:.37},pad:{inst:`pad`,vol:.37,rev:.4},dr:{kit:!0,vol:.7},drF:{kit:!0,vol:1.35,when:`final`}},sec:{intro:{chords:`G D7`,parts:{sham:$(`8| . R+5 . R+5 . R+5 . R+5`,50),lead:[null,`. . . . . . . . . . G4 - A4 - B4 -`],bass:Bm,dr:[zm.in1,zm.in2]}},A:{chords:`G Em Am7_D7 G C Bm7_Em Am7_D7 G`,parts:{lead:[`D5 - - - E5 - G5 - - - E5 - D5 - B4 -`,`D5 - - - - - - - . . B4 - D5 - E5 -`,`G5 - - - E5 - D5 - E5 - - - D5 - B4 -`,`B4 - - - A4 - G4 - - - - - . . . .`,`E5 - - - G5 - A5 - - - G5 - E5 - D5 -`,`D5 - - - - - B4 - D5 - - - E5 - - -`,`G5 - - - E5 - D5 - E5 - - - A5 - G5 -`,`G5 - - - - - - - - - - - . . D5 E5`],sham:$(`8| . R+5 . R+5 . R+5 . R+5?`,50),koto:$(`8| R 5 8 10 12 10 8 5`,55),bass:[Bm,Bm,Vm,Bm,Bm,Bm,Vm,Bm],dr:[zm.a1,zm.a,zm.a,zm.a4,zm.a,zm.a,zm.a,zm.a8],drF:zm.fin}},B:{chords:`C D Bm7 Em Am7 D7 Bm7_Em Am7_D7`,parts:{lead:[`G5 - - - - - E5 - G5 - A5 - - - G5 -`,`A5 - - - - - - - . . D5 - E5 - G5 -`,`B5 - - - A5 - - - B5 - D6 - - - B5 -`,`G5 - - - E5 - - - - - - - . . D5 E5`,`G5 - - - E5 - D5 - E5 - - - G5 - A5 -`,`A5 - - - - - - - D6 - B5 - A5 - D6 -`,`B5 - - - A5 - G5 - E5 - - - D5 - E5 -`,`G5 - - - - - - - A5 - - - . . . .`],sham:$(`8| . R+5 . R+5! . R+5 . R+5`,50),koto:$(`8| R 5 8 10 12 10 8 5`,55),pad:Sm(55,4),bass:[Bm,Bm,Bm,Bm,Bm,Bm,Bm,Vm],dr:[zm.b1,zm.b,zm.b,zm.b4,zm.b,zm.b,zm.b,zm.b8],drF:zm.fin}}}},Um={in1:{don:`X...............`,h:`........x.x.x.x.`},in2:{don:`X.......X...X.X.`,h:`xoxoxoxoxoxoxoxo`,s:`............x.xx`},a:{k:`X...x...X...x...`,s:`....X.......X...`,h:`xoxoxoxoxoxoxoxo`,ka:`..........x.....`},a1:{k:`X...x...X...x...`,s:`....X.......X...`,h:`xoxoxoxoxoxoxoxo`,don:`X...............`,cr:`X...............`},a4:{k:`X...x...X...x...`,s:`....X.......XxXX`,h:`xoxoxoxoxoxo....`,don:`........X.x.X.X.`},a8:{k:`X...x...X.......`,s:`....X...X.X.XXXX`,h:`xoxoxoxo........`,don:`X.......X.X.XXXX`},b:{k:`X...x...X...x...`,s:`....X.......X...`,c:`....x.......x...`,h:`x.x.x.x.x.x.x.x.`,oh:`..x...x...x...x.`,sh:`o..o..o.o..o..o.`},b1:{k:`X...x...X...x...`,s:`....X.......X...`,c:`....x.......x...`,h:`x.x.x.x.x.x.x.x.`,oh:`..x...x...x...x.`,don:`X...............`,cr:`X...............`},b4:{k:`X...x...X...x...`,s:`....X.......XxXX`,c:`....x.......x...`,h:`x.x.x.x.x.x.....`,don:`........X...X.X.`},b8:{k:`X...x...X.......`,s:`....X...XXXXXXXX`,don:`X.......X.X.XXXX`,cr:`................`},fin:{sh:`xoxoxoxoxoxoxoxo`}},Wm=$(`8| R! R 8 R R! R 8 R`,33),Gm=$(`8| R! R 8 R R! 8 R 8`,33),Km={id:`sakura`,bpm:156,gain:1,ch:{lead:{inst:`flute`,vol:.68,pan:.04,rev:.28,lp:6500},str:{inst:`strings`,vol:.6,pan:-.14,rev:.35,copy:`lead`,tr:-12,secs:[`B`],when:`odd`},koto:{inst:`koto`,vol:.68,pan:.28,rev:.24},sham:{inst:`shamisen`,vol:.69,pan:-.32,rev:.12,choke:!0,strum:.008},bass:{inst:`bass`,vol:.3},pad:{inst:`pad`,vol:.37,rev:.4},bell:{inst:`glock`,vol:.3,pan:.36,rev:.4},dr:{kit:!0,vol:.38},drF:{kit:!0,vol:1.5,when:`final`}},sec:{intro:{chords:`Am E`,parts:{koto:$(`R 5 8 10 12 10 8 5 R 5 8 10 12 10 8 5`,52),lead:[null,`. . . . . . . . B4 - - - C5 - D5 -`],bass:[null,Wm],dr:[Um.in1,Um.in2]}},A:{chords:`Am Fmaj7 Dm7 Esus4_E Am_Dm7 Fmaj7 Dm7_E7sus4 Am`,parts:{lead:[`E5 - - - F5 - E5 - C5 - - - B4 - A4 -`,`B4 - - - C5 - - - A4 - - - - - - -`,`A4 - - - C5 - D5 - E5 - - - F5 - E5 -`,`E5 - - - - - - - B4 - - - . . E5 F5`,`A5!* - - - B5 - A5 - F5 - - - E5 - C5 -`,`E5 - - - F5 - - - C5 - - - - - - -`,`D5 - - - C5 - B4 - A4 - - - B4 - C5 -`,`B4 - - - - - - - A4 - - - . . . .`],koto:$(`R 5 8 10 12 10 8 5 R 5 8 10 12 10 8 5`,52),bass:Wm,pad:Sm(57,4),dr:[Um.a1,Um.a,Um.a,Um.a4,Um.a,Um.a,Um.a,Um.a8],drF:Um.fin}},B:{chords:`Fmaj7 G Em7 Am7 Dm7 G C E7`,parts:{lead:[`A5 - - - G5 - A5 - C6 - - - A5 - G5 -`,`G5 - - - - - - - D5 - E5 - G5 - - -`,`E5 - - - G5 - A5 - G5 - - - E5 - D5 -`,`E5 - - - - - - - . . C5 - D5 - E5 -`,`A5 - - - G5 - A5 - C6 - - - D6 - C6 -`,`D6*! - - - - - - - C6 - A5 - G5 - - -`,`E5 - - - G5 - - - C6 - - - - - - -`,`B5 - - - - - - - G#5 - - - . . . .`],koto:$(`8| R 5 8 10 12 10 8 5`,55),sham:$(`8| . R+5 . R+5 . R+5 . R+5`,52),bass:Gm,pad:Sm(57,4),bell:[`8| . . . . . . . .`,null,null,`8| . . . . . G6 A6 C7`,null,null,null,`8| . . . . . . . .`],dr:[Um.b1,Um.b,Um.b,Um.b4,Um.b1,Um.b,Um.b,Um.b8],drF:Um.fin}}}},qm={in1:{don:`X.x.X.x.X.x.X.x.`,sh:`1.2.3.4.5.6.7.8.`,sy:`x...............`},in2:{don:`X.x.X.x.XxXxXXXX`,sh:`XoxoXoxoXXXXXXXX`,kn:`x.......x.......`,ha:`............x...`},a:{k:`X...X...X...X...`,c:`....X.......X...`,don:`X.x.....X.x.....`,ka:`....x.x.....x.x.`,sh:`XoxoXoxoXoxoXoxo`,cp:`..x...x...x...x.`,kn:`x.......x.......`,km:`.....x.......x..`},a1:{k:`X...X...X...X...`,c:`....X.......X...`,don:`X.x.....X.x.....`,ka:`....x.x.....x.x.`,sh:`XoxoXoxoXoxoXoxo`,cp:`..x...x...x...x.`,kn:`x.......x.......`,cr:`X...............`},a4:{k:`X...X...X...X...`,c:`....X.......X...`,don:`X.x.X.x.X.x.XXXX`,sh:`XoxoXoxoXxxxXXXX`,cp:`..x...x...x.....`,kn:`x.......x.......`},a8:{k:`X...X...X.......`,don:`X.x.X.x.XxXxXXXX`,sh:`XxxxXxxxXXXXXXXX`,kn:`x...x...x.......`,sy:`............x...`},b:{k:`X...X...X...X...`,c:`....X.......X...`,don:`X..x..x.X..x..x.`,ka:`..x.......x.....`,sh:`XoxoXoxoXoxoXoxo`,oh:`..x...x...x...x.`,cp:`..x...x...x...x.`,kn:`x...x...x...x...`},b1:{k:`X...X...X...X...`,c:`....X.......X...`,don:`X..x..x.X..x..x.`,sh:`XoxoXoxoXoxoXoxo`,oh:`..x...x...x...x.`,cp:`..x...x...x...x.`,kn:`x...x...x...x...`,cr:`X...............`},b4:{k:`X...X...X...X...`,c:`....X.......X...`,don:`X..x..x.X.x.X.x.`,sh:`XoxoXoxoXxxxXxxx`,cp:`..x...x.........`,ha:`............x...`},b8:{k:`X...X...X.......`,don:`X.x.X.x.XxXxXXXX`,sh:`XxxxXxxxXXXXXXXX`,kn:`x...x...x...x...`,cr:`............X...`},fin:{h:`xoxoxoxoxoxoxoxo`,ka:`..x...x...x...x.`,don:`......x.......x.`}},Jm=$(`8| R! 8 R 8 R! 8 R 8`,34),Ym=$(`8| R! 8 R 8 5 5 A A`,34),Xm={id:`matsuri`,bpm:168,gain:1,ch:{lead:{inst:`flute`,vol:.66,pan:.05,rev:.25,lp:7e3},lead2:{inst:`flute`,vol:.31,pan:-.22,rev:.3,copy:`lead`,tr:-12,when:`odd`},sham:{inst:`shamisen`,vol:.66,pan:-.3,rev:.12,choke:!0},bass:{inst:`bass`,vol:.33},pad:{inst:`strings`,vol:.37,pan:.1,rev:.35},dr:{kit:!0,vol:.52},drF:{kit:!0,vol:.55,when:`final`}},sec:{intro:{chords:`Dm Dm`,parts:{lead:[`D6 - - - - - - - - - - - - - - -`,`- - - - - - - - C6 - A5 - C6 - . .`],dr:[qm.in1,qm.in2]}},A:{chords:`Dm C Bb C Dm C Bb_C Dm`,parts:{lead:[`D6!* - - - C6 - A5 - C6 - D6 - A5 - G5 -`,`A5 - - - - - G5 - A5 - C6 - - - A5 -`,`G5 - - - F5 - D5 - F5 - G5 - A5 - C6 -`,`A5 - - - - - - - G5 - - - A5 - - -`,`D6!* - - - C6 - A5 - C6 - D6 - F6 - D6 -`,`C6 - - - - - A5 - G5 - A5 - C6 - - -`,`D6 - - - C6 - A5 - G5 - - - A5 - C6 -`,`D6 - - - - - - - . . . . . . . .`],sham:$(`R! . R 5 . R 8 . R! . R 5 . R 8 5`,50),bass:[Jm,Jm,Jm,Ym,Jm,Jm,Jm,Ym],dr:[qm.a1,qm.a,qm.a,qm.a4,qm.a,qm.a,qm.a,qm.a8],drF:qm.fin}},B:{chords:`Bb C Am Dm Bb C Dm C`,parts:{lead:[`F5 - G5 - A5 - - - C6 - A5 - G5 - F5 -`,`G5 - - - - - - - . . A5 - C6 - D6 -`,`C6 - - - A5 - - - G5 - A5 - C6 - A5 -`,`D6 - - - - - - - . . . . . . . .`,`F6!* - - - D6 - C6 - D6 - - - C6 - A5 -`,`C6 - - - - - A5 - G5 - A5 - C6 - D6 -`,`D6 - - - C6 - A5 - G5 - F5 - G5 - A5 -`,`G5 - - - - - - - - - - - . . . .`],sham:$(`8| . R+5 . R+5! . R+5 . R+5`,50),bass:[Jm,Jm,Jm,Ym,Jm,Jm,Jm,Ym],pad:Sm(57,4),dr:[qm.b1,qm.b,qm.b,qm.b4,qm.b1,qm.b,qm.b,qm.b8],drF:qm.fin}}}},Zm=e=>({...e,form:{intro:[`J`],loop:[]}}),Qm=Zm({id:`start`,bpm:150,gain:1,ch:{lead:{inst:`flute`,vol:.66,pan:.05,rev:.28,lp:7e3},sham:{inst:`shamisen`,vol:.75,pan:-.28,rev:.12,choke:!0},brass:{inst:`brass`,vol:.55,pan:.1,rev:.22},bass:{inst:`bass`,vol:.36},dr:{kit:!0,vol:.65}},sec:{J:{chords:`D D`,parts:{lead:[`D5 - E5 - F#5 - A5 - B5 - D6 - E6 - F#6 -`,`D6! - - - - - A5 - D6! - - - - - - -`],sham:[`D4? A4? D4? A4? D4? A4? D4 A4 D4 A4 D4 A4 D4! A4! D4! A4!`,`D5! . . . . . A4 . D5! . . . . . . .`],brass:[null,`D4+F#4+A4+D5! - - - . . A3+E4+A4+C#5 - D4+F#4+A4+D5! - - - - - - -`],bass:[null,`D2! - - - . . A1 - D2! - - - - - - -`],dr:[{don:`X...X...X.X.XXXX`,sh:`1122334455667789`},{k:`X.....x.X.......`,don:`X.....X.X.......`,cr:`X.......X.......`,kn:`X.......X.......`}]}}}}),$m=Zm({id:`final_lap`,bpm:160,gain:1,ch:{lead:{inst:`flute`,vol:.66,pan:.05,rev:.26,lp:7e3},brass:{inst:`brass`,vol:.55,pan:-.08,rev:.22},bass:{inst:`bass`,vol:.36},dr:{kit:!0,vol:.65}},sec:{J:{chords:`D D`,parts:{lead:[`A5 - A5 - A5 - D6! - - - - - B5 - C#6 -`,`D6! - - - - - - - . . . . . . . .`],brass:[`D4+F#4+A4 . D4+F#4+A4 . D4+F#4+A4 . D4+F#4+A4+D5! - - - - - G4+B4+D5 - A4+C#5+E5 -`,`D4+F#4+A4+D5! - - - - - - - . . . . . . . .`],bass:[`D2 . D2 . D2 . D2 - - - - - G2 - A2 -`,`D2! - - - - - - - . . . . . . . .`],dr:[{don:`X.X.X.X.....X.X.`,sh:`..........xxxxxx`,cr:`......X.........`},{don:`X...............`,cr:`X...............`,kn:`X...............`}]}}}}),eh=Zm({id:`finish_win`,bpm:132,gain:1,ch:{lead:{inst:`flute`,vol:.66,pan:.05,rev:.3,lp:7e3},bell:{inst:`glock`,vol:.4,pan:.3,rev:.4},brass:{inst:`brass`,vol:.5,pan:-.1,rev:.25},str:{inst:`strings`,vol:.4,pan:.1,rev:.35},sham:{inst:`shamisen`,vol:.66,pan:-.3,rev:.12,choke:!0},bass:{inst:`bass`,vol:.34},dr:{kit:!0,vol:.65}},sec:{J:{chords:`G_A D`,parts:{lead:[`F#5 - A5 - B5! - - - A5 - B5 - D6 - E6 -`,`F#6! - - - - - - - - - - - - - - -`],bell:[null,`D6 F#6 A6 D7 . . . . . . . . . . . .`],brass:[`G4+B4+D5 - - - - - - - A4+C#5+E5 - - - - - - -`,`D4+F#4+A4+D5! - - - - - - - - - - - - - - -`],str:[`2| G4+B4+D5 A4+C#5+E5`,`1| F#4+A4+D5+F#5`],sham:[`G4 . D5 . G4 . D5 . A4 . E5 . A4 . C#5 .`,`D5! . . . . . . . . . . . . . . .`],bass:[`G2 - - - - - - - A2 - - - - - - -`,`D2! - - - - - - - - - - - - - - -`],dr:[{k:`X.......X.......`,don:`X.......X...X.XX`,s:`....X.......XXXX`,h:`x.x.x.x.x.x.x.x.`},{k:`X...............`,don:`X...............`,cr:`X...............`,kn:`X...............`}]}}}}),th=Zm({id:`finish_lose`,bpm:108,gain:1,ch:{lead:{inst:`shaku`,vol:.62,pan:.05,rev:.4},koto:{inst:`koto`,vol:.7,pan:-.2,rev:.35,strum:.03},pad:{inst:`pad`,vol:.42,rev:.45},bass:{inst:`bass`,vol:.3,cut:220},dr:{kit:!0}},sec:{J:{chords:`Bm_G D`,parts:{lead:[`A5 - - - F#5 - E5 - D5 - - - B4 - - -`,`D5 - - - - - - - . . . . . . . .`],koto:[`8| B5 F#5 D5 B4 G5 D5 B4 G4`,`2| D4+A4+D5+F#5 .`],pad:[`2| B3+D4+F#4+A4 G3+B3+D4+G4`,`2| A3+D4+F#4+A4 .`],bass:[`2| B1 G1`,`2| D2 .`],dr:[null,{don:`o...............`}]}}}}),nh={id:`star`,bpm:176,gain:1,form:{intro:[],loop:[`L`]},kit:{k:{vol:.5}},ch:{mar:{inst:`marimba`,vol:.9,pan:-.1,rev:.18},bell:{inst:`glock`,vol:.3,pan:.3,rev:.25,copy:`mar`},sham:{inst:`shamisen`,vol:.65,pan:-.3,rev:.1,choke:!0},bass:{inst:`bass`,vol:.34},dr:{kit:!0,vol:.7}},sec:{L:{chords:`C F G C`,parts:{mar:[`C5 . E5 G5 . E5 G5 . A5 . G5 . E5 . G5 .`,`A5 . C6 A5 . G5 A5 . C6 . A5 . G5 . E5 .`,`D5 . G5 A5 . G5 D6 . B5 . A5 . G5 . A5 .`,`C6 . . G5 . . E5 . C6! . . . . . . .`],sham:$(`8| . R+5 . R+5 . R+5 . R+5`,55),bass:$(`8| R! 8 R 8 R! 8 R 8`,36),dr:[{k:`X...X...X...X...`,c:`....X.......X...`,h:`xxxxxxxxxxxxxxxx`,sh:`oxoxoxoxoxoxoxox`},{k:`X...X...X...X...`,c:`....X.......X...`,h:`xxxxxxxxxxxxxxxx`,sh:`oxoxoxoxoxoxoxox`},{k:`X...X...X...X...`,c:`....X.......X...`,h:`xxxxxxxxxxxxxxxx`,sh:`oxoxoxoxoxoxoxox`},{k:`X...X...X...X...`,c:`....X.......X...`,h:`xxxxxxxxxxxx....`,sh:`oxoxoxoxxxxxXXXX`,kn:`X...............`}]}}}},rh=[`title`,`select`,`inaka`,`sakura`,`matsuri`,`results`],ih=[`start`,`final_lap`,`finish_win`,`finish_lose`],ah={title:Nm,select:Im,inaka:Hm,sakura:Km,matsuri:Xm,results:Rm,start:Qm,final_lap:$m,finish_win:eh,finish_lose:th,star:nh},oh=new Map;function sh(e){if(!ah[e])return null;let t=oh.get(e);return t||(t=Em(ah[e]),t.warnings.length&&console.warn(`[audio] song `+e+`:
  `+t.warnings.join(`
  `)),oh.set(e,t)),t}function ch(e,t,n,r,i,a){let o=e.ctx.createOscillator();return o.type=t,o.frequency.setValueAtTime(n,r),o.start(r),o.stop(i),a&&o.connect(a),e.srcs.push(o),o}function lh(e,t,n,r,i){let a=e.ctx.createBufferSource();return a.buffer=i||op(e.ctx.sampleRate),a.loop=!0,a.start(t,e.r()*3),a.stop(n),r&&a.connect(r),e.srcs.push(a),a}function uh(e,t,n,r,i,a=1){if(!t)return null;let o=e.ctx.createBufferSource();o.buffer=t,o.playbackRate.value=r;let s=dh(e,a,i);return o.connect(s),o.start(n),e.srcs.push(o),o}function dh(e,t=0,n){let r=e.ctx.createGain();return r.gain.value=t,n&&r.connect(n),r}function fh(e,t,n,r=.7,i){let a=e.ctx.createBiquadFilter();return a.type=t,a.frequency.value=n,a.Q.value=r,i&&a.connect(i),a}function ph(e,t,n,r,i){e.setValueAtTime(0,t),e.linearRampToValueAtTime(r,t+n),e.setTargetAtTime(0,t+n,i)}function mh(e,t,n,r,i,a){e.setValueAtTime(0,t),e.linearRampToValueAtTime(r,t+n),e.setValueAtTime(r,t+n+i),e.setTargetAtTime(0,t+n+i,a)}function hh(e,t,n,r,i){e.setValueAtTime(Math.max(1,n),t),e.exponentialRampToValueAtTime(Math.max(1,r),t+i)}var gh=(e,t,n,r,i=1,a=e.out)=>uh(e,Cp(t,n,e.ctx.sampleRate),r,e.p,a,i),_h=(e,t,n,r=1,i=1,a=e.out)=>uh(e,Jp(t,e.ctx.sampleRate),n,r*e.p,a,i);function vh(e,t,n,r,i,a,o=1.2,s=e.out){let c=dh(e,0,s),l=fh(e,`bandpass`,r*e.p,o,c);hh(l.frequency,t,r*e.p,i*e.p,n),c.gain.setValueAtTime(0,t),c.gain.linearRampToValueAtTime(a,t+n*.35),c.gain.linearRampToValueAtTime(0,t+n),lh(e,t,t+n+.02,l)}function yh(e,t,n,r,i,a,o,s=e.out,c=a){let l=dh(e,0,s),u=ch(e,t,r*e.p,n,n+a+.05,l);return hh(u.frequency,n,r*e.p,i*e.p,c),ph(l.gain,n,.004,o,a/4),u}function bh(e,t,n,r,i,a,o=e.out){yh(e,`sine`,t,n,r,i,a,o,i*.6);let s=dh(e,0,o),c=fh(e,`lowpass`,700,.7,s);ph(s.gain,t,.002,a*.6,i/6),lh(e,t,t+i,c)}function xh(e){let t=Math.floor(e*2),n=new Float32Array(t),r=Kf(808),i=[[1,1,1.5],[1.52,.85,1.2],[2.21,.95,1],[2.63,.7,.85],[3.37,.6,.65],[4.18,.45,.5],[5.06,.32,.38],[6.2,.2,.26],[7.4,.1,.18]],a=i.map(()=>r()*Hf),o=new Q(`bp`,1300,.8,e);for(let s=0;s<t;s++){let t=s/e,c=1-.035*(1-Math.exp(-t/.5)),l=1+.4*Math.exp(-t/.55)*Math.sin(Hf*6.5*t),u=0;for(let n=0;n<i.length;n++){let[r,o,s]=i[n],l=330*r*c;if(l>e*.45)continue;let d=Math.exp(-t/s);u+=o*d*(Math.sin(Hf*l*t+a[n])+.6*Math.sin(Hf*l*1.007*t+a[n]*1.3))}let d=u*l*Math.min(1,t/.0015)*.35;d+=o.process(r()*2-1)*Math.exp(-t/.012)*2.2,d+=Math.sin(Hf*(150-40*Math.min(1,t/.08))*t)*Math.exp(-t/.05)*.8,n[s]=Math.tanh(1.3*d)}return new Q(`lp`,7e3,.7,e).run(n),Qf(n,e,{fade:.25})}function Sh(e,t=2.2,n=909){let r=Math.floor(e*t),i=new Float32Array(r),a=new Float32Array(r),o=Kf(n);for(let n=0;n<420;n++){let n=o()**1.8*(t-.1),s=Math.floor(n*e),c=(.3+o()*.7)*Math.exp(-n/.9),l=o(),u=20+Math.floor(o()*80);for(let e=0;e<u&&s+e<r;e++){let t=(o()*2-1)*c*Math.exp(-e/(u*.3));i[s+e]+=t*(1-l),a[s+e]+=t*l}}let s=new Q(`hp`,1800,.7,e),c=new Q(`hp`,1800,.7,e),l=new Q(`lp`,8e3,.7,e),u=new Q(`lp`,8e3,.7,e);return s.run(i),c.run(a),l.run(i),u.run(a),Xf([i,a],.85)}function Ch(e,t,n){let r=Math.floor(e*.7),i=new Float32Array(r),a=Kf(n),o=[[1,1,.5],[2.02,.45,.32],[2.95,.3,.2],[4.1,.18,.12],[5.3,.08,.08]];for(let n=0;n<r;n++){let r=n/e,s=0;for(let[e,n,i]of o)s+=n*Math.sin(Hf*t*e*r)*Math.exp(-r/i);i[n]=s*Math.min(1,r/.001)+(r<.01?(a()*2-1)*Math.exp(-r/.002)*.4:0)}return new Q(`lp`,6500,.7,e).run(i),Qf(i,e,{fade:.05})}var wh={kanedarai:e=>ip(`fx:kanedarai`,e,xh),crackle:e=>ip(`fx:crackle`,e,e=>Sh(e)),crossA:e=>ip(`fx:crossA`,e,e=>Ch(e,760,1)),crossB:e=>ip(`fx:crossB`,e,e=>Ch(e,705,2))},Th={count(e){let{t}=e;_h(e,`taiko`,t,1.3,.35);let n=dh(e,0,e.out);ch(e,`triangle`,784*e.p,t,t+.6,n);let r=dh(e,.18,n);return ch(e,`sine`,1568*e.p,t,t+.6,r),mh(n.gain,t,.005,.5,.16,.06),t+.6},go(e){let{t}=e;_h(e,`taiko`,t,1,.55),_h(e,`kane`,t,1,.35),_h(e,`crash`,t+.01,1,.3);let n=dh(e,0,e.out);for(let r of[880,1175,1480])ch(e,`triangle`,r*e.p,t,t+1.3,n);return mh(n.gain,t,.006,.28,.45,.18),t+1.4},drift_hop(e){let{t}=e;return yh(e,`sine`,t,280,600,.09,.5),bh(e,t,140,80,.06,.25),vh(e,t,.06,2500,1800,.08,3),t+.2},turbo1(e){return Eh(e,1)},turbo2(e){return Eh(e,2)},turbo3(e){return Eh(e,3)},boost(e){let{t}=e;vh(e,t,.9,350,2600,.55,.9),vh(e,t+.05,.7,1200,5e3,.18,1.5);let n=dh(e,0,e.out),r=fh(e,`lowpass`,900,1.5,n);return hh(ch(e,`sawtooth`,90*e.p,t,t+1,r).frequency,t,90*e.p,260*e.p,.6),hh(r.frequency,t,400,2200,.5),mh(n.gain,t,.03,.22,.35,.15),bh(e,t,110,45,.3,.4),t+1.1},dash_panel(e){let{t}=e,n=dh(e,0,e.out),r=fh(e,`lowpass`,3200,1,n);for(let[n,i]of[[1,0],[1.5,.05]])hh(ch(e,`square`,380*n*e.p,t+i,t+i+.35,r).frequency,t+i,380*n*e.p,1500*n*e.p,.22);return mh(n.gain,t,.01,.16,.18,.06),vh(e,t,.45,600,3500,.35,1),t+.55},jump(e){let{t}=e;return vh(e,t,.3,500,1900,.3,1.2),yh(e,`sine`,t,180,440,.18,.35),t+.35},land(e){let{t}=e;bh(e,t,95,42,.22,.6);let n=dh(e,0,e.out),r=fh(e,`bandpass`,1500,2,n);return ph(n.gain,t,.002,.25,.015),lh(e,t,t+.1,r),_h(e,`wood`,t+.01,.6,.12),t+.35},trick(e){let{t}=e;vh(e,t,.35,700,3200,.35,1.3),[84,88,91,96].forEach((n,r)=>gh(e,`glock`,n,t+.06+r*.035,.35));let n=dh(e,0,e.out),r=ch(e,`sine`,2637*e.p,t+.18,t+1,n),i=ch(e,`sine`,13,t+.18,t+1),a=dh(e,40*e.p,r.frequency);return i.connect(a),ph(n.gain,t+.18,.01,.14,.22),t+1},glider_open(e){let{t}=e,n=dh(e,0,fh(e,`lowpass`,5e3,.7,e.out)),r=fh(e,`bandpass`,3e3*e.p,.9,n);return hh(r.frequency,t,3200*e.p,800*e.p,.12),n.gain.setValueAtTime(0,t),[0,.028,.055,.085].forEach((e,r)=>{n.gain.linearRampToValueAtTime(.9-r*.18,t+e+.004),n.gain.linearRampToValueAtTime(.12,t+e+.024)}),n.gain.setTargetAtTime(0,t+.11,.05),lh(e,t,t+.4,r),yh(e,`sine`,t+.01,320,210,.08,.35),t+.45},itembox(e){let{t}=e,n=dh(e,0,e.out),r=fh(e,`highpass`,2500,.7,n);ph(n.gain,t,.001,.5,.02),lh(e,t,t+.12,r);for(let n=0;n<5;n++)yh(e,`sine`,t+.01+e.r()*.06,3e3+e.r()*3e3,2600+e.r()*2e3,.05,.12);return[91,95,98,103].forEach((n,r)=>gh(e,`glock`,n,t+.05+r*.04,.28)),t+.9},roulette(e){let{t}=e,n=(e.r()<.5?1760:2093)*e.p,r=dh(e,0,e.out);return ch(e,`triangle`,n,t,t+.08,r),ph(r.gain,t,.002,.3,.018),t+.08},item_get(e){let{t}=e;gh(e,`glock`,88,t,.6),gh(e,`glock`,95,t+.005,.45);let n=dh(e,0,e.out);return ch(e,`sine`,1318.5*e.p,t,t+1.2,n),ph(n.gain,t,.003,.25,.3),t+1.2},throw(e){let{t}=e;return vh(e,t,.25,1900,500,1.2,2),t+.3},shuriken(e){let{t}=e,n=dh(e,.5,e.out),r=dh(e,0,n),i=fh(e,`lowpass`,7e3,.7,r),a=ch(e,`sine`,3150*e.p,t,t+.55,i),o=ch(e,`sine`,4480*e.p,t,t+.55),s=dh(e,2600*e.p,a.frequency);return o.connect(s),hh(ch(e,`sine`,26,t,t+.55,dh(e,.5,n.gain)).frequency,t,30,18,.5),ph(r.gain,t,.004,.3,.14),vh(e,t,.3,4e3,2200,.5,2),t+.6},daruma_bounce(e){let{t}=e;return _h(e,`wood`,t,.55,.8),bh(e,t,190,150,.08,.35),t+.25},makibishi_drop(e){let{t}=e;bh(e,t,120,70,.08,.2);for(let n=0;n<8;n++)yh(e,`sine`,t+e.r()*.3,3200+e.r()*2600,3e3+e.r()*2e3,.035,.12+e.r()*.1);return t+.45},hit(e){let{t}=e;bh(e,t,75,38,.4,.7);let n=dh(e,0,e.out),r=fh(e,`lowpass`,1800,.7,n);ph(n.gain,t,.002,.6,.09),lh(e,t,t+.4,r);let i=dh(e,0,e.out),a=fh(e,`bandpass`,620,1.5,i);return ph(i.gain,t,.002,.5,.04),lh(e,t,t+.2,a),_h(e,`kaneM`,t+.01,.45,.2),t+.5},spinout(e){let{t}=e,n=dh(e,0,e.out),r=ch(e,`triangle`,900*e.p,t,t+1,n);hh(r.frequency,t,900*e.p,420*e.p,.9);let i=ch(e,`sine`,8,t,t+1);hh(i.frequency,t,7,17,.9);let a=dh(e,170*e.p,r.frequency);return i.connect(a),mh(n.gain,t,.02,.22,.6,.12),vh(e,t,.9,800,1600,.15,1.5),t+1.1},manekineko(e){let{t}=e;_h(e,`kane`,t,1.5,.25),[84,86,88,91,93,96,98,100].forEach((n,r)=>gh(e,`glock`,n,t+.03+r*.045,.3));let n=dh(e,0,e.out);for(let r of[1047,1319,1568,2093]){let i=ch(e,`sine`,r*e.p,t+.1,t+1.6,n);ch(e,`sine`,6+e.r()*2,t+.1,t+1.6).connect(dh(e,r*.006,i.frequency))}return mh(n.gain,t+.1,.25,.06,.4,.25),t+1.6},kanedarai(e){let{t}=e;return uh(e,wh.kanedarai(e.ctx.sampleRate),t,e.p,e.out,.95),t+2/e.p},coin(e){let{t}=e,n=dh(e,0,e.out),r=fh(e,`bandpass`,5200,1.2,n);ph(n.gain,t,.001,.25,.008),lh(e,t,t+.05,r);for(let[n,r,i,a]of[[1976,0,.3,.05],[2637,.065,.32,.16]]){let o=dh(e,0,e.out);ch(e,`sine`,n*e.p,t+r,t+r+.7,o);let s=dh(e,.3,o);ch(e,`sine`,n*2.41*e.p,t+r,t+r+.7,s),ph(o.gain,t+r,.001,i,a)}return t+.75},wall(e){let{t}=e;return bh(e,t,110,55,.18,.6),_h(e,`wood`,t,.7,.25),t+.3},bump(e){let{t}=e,n=dh(e,0,e.out),r=ch(e,`sine`,210*e.p,t,t+.25,n);return r.frequency.setValueAtTime(210*e.p,t),r.frequency.exponentialRampToValueAtTime(130*e.p,t+.05),r.frequency.exponentialRampToValueAtTime(190*e.p,t+.14),ph(n.gain,t,.003,.5,.05),_h(e,`wood`,t,.9,.2),t+.3},splash(e){let{t}=e,n=dh(e,0,e.out),r=fh(e,`lowpass`,4e3,.7,n);hh(r.frequency,t,4500,600,.6),ph(n.gain,t,.01,.6,.18),lh(e,t,t+.9,r);for(let n=0;n<9;n++){let n=600+e.r()*1300;yh(e,`sine`,t+.05+e.r()*.6,n,n*1.6,.04,.1+e.r()*.08)}return t+.9},lap(e){let{t}=e;return[84,88,91,96].forEach((n,r)=>gh(e,`glock`,n,t+r*.075,r===3?.6:.45)),t+1.6},menu_move(e){let{t}=e;return _h(e,`wood`,t,1.45,1),t+.15},menu_ok(e){let{t}=e;return gh(e,`koto`,84,t,.55),gh(e,`koto`,91,t+.06,.55),gh(e,`glock`,96,t+.06,.12),_h(e,`taikoKa`,t,1.2,.15),t+1.2},menu_back(e){let{t}=e;return gh(e,`koto`,79,t,.45),gh(e,`koto`,74,t+.07,.45),t+1},firework(e){let{t}=e;bh(e,t,70,32,.9,.8);let n=dh(e,0,e.out),r=fh(e,`lowpass`,900,.7,n);return ph(n.gain,t,.004,.7,.2),lh(e,t,t+1,r,sp(e.ctx.sampleRate)),uh(e,wh.crackle(e.ctx.sampleRate),t+.18,e.p,e.out,.35),t+2.5},train_horn(e){let{t}=e,n=dh(e,0,e.out),r=fh(e,`peaking`,1100,1,fh(e,`lowpass`,2600,.7,n));r.gain.value=5;for(let n of[370,466]){let i=ch(e,`sawtooth`,n*1.03*e.p,t,t+1.8,r);i.frequency.setValueAtTime(n*1.03*e.p,t),i.frequency.setTargetAtTime(n*e.p,t,.08),ch(e,`sine`,5.5,t,t+1.8).connect(dh(e,n*.003,i.frequency))}mh(n.gain,t,.06,.2,1.15,.1);let i=dh(e,0,e.out),a=fh(e,`bandpass`,1400,.8,i);return mh(i.gain,t,.05,.05,1.15,.1),lh(e,t,t+1.8,a),t+1.8},respawn(e){let{t}=e,n=dh(e,.6,e.out),r=dh(e,0,n);return hh(ch(e,`sine`,400*e.p,t,t+.8,r).frequency,t,400*e.p,1600*e.p,.55),ch(e,`sine`,18,t,t+.8,dh(e,.4,n.gain)),mh(r.gain,t,.05,.14,.45,.08),vh(e,t,.6,400,2400,.2,1),[79,84,88,91].forEach((n,r)=>gh(e,`glock`,n,t+.3+r*.06,.25)),t+1.2},wrong_way(e){let{t}=e,n=dh(e,0,e.out),r=fh(e,`lowpass`,1300,.7,n);for(let n of[185,196])ch(e,`square`,n*e.p,t,t+.75,r);return n.gain.setValueAtTime(0,t),n.gain.linearRampToValueAtTime(.12,t+.01),n.gain.setValueAtTime(.12,t+.11),n.gain.linearRampToValueAtTime(0,t+.13),n.gain.setValueAtTime(0,t+.19),n.gain.linearRampToValueAtTime(.12,t+.2),n.gain.setValueAtTime(.12,t+.62),n.gain.linearRampToValueAtTime(0,t+.68),t+.75}};function Eh(e,t){let{t:n}=e,r=.35+.18*t;vh(e,n,r,500,2e3+700*t,.28+.1*t,1.1);let i=dh(e,0,e.out),a=fh(e,`lowpass`,700,1.4,i);return hh(ch(e,`sawtooth`,100*e.p,n,n+r+.1,a).frequency,n,100*e.p,(160+60*t)*e.p,r*.6),hh(a.frequency,n,500,1400+500*t,r*.5),mh(i.gain,n,.02,.1+.05*t,r*.4,.08),t>=2&&bh(e,n,130,50,.2,.25+.1*t),t>=3&&[91,96,100].forEach((t,r)=>gh(e,`glock`,t,n+.04+r*.03,.18)),n+r+.2}var Dh={count:{g:.71,max:2,rev:.2},go:{g:.86,max:1,rev:.3},drift_hop:{g:1.17,max:2},turbo1:{g:1.3,max:2},turbo2:{g:1.19,max:2},turbo3:{g:1.07,max:2,rev:.1},boost:{g:1.29,max:2},dash_panel:{g:.8,max:2},jump:{g:1.6,max:2},land:{g:.81,max:2},trick:{g:.72,max:2,rev:.2},glider_open:{g:2,max:2},itembox:{g:.83,max:3,rev:.15},roulette:{g:2.4,max:2},item_get:{g:.63,max:2,rev:.2},throw:{g:1.26,max:3},shuriken:{g:1.4,max:3},daruma_bounce:{g:.89,max:3},makibishi_drop:{g:1.55,max:2},hit:{g:.96,max:3},spinout:{g:1.07,max:2},manekineko:{g:.78,max:1,rev:.3},kanedarai:{g:.77,max:2,rev:.25},coin:{g:.75,max:4,rev:.1},wall:{g:1.03,max:3},bump:{g:1.06,max:3},splash:{g:1.42,max:2},lap:{g:.66,max:1,rev:.25},menu_move:{g:.93,max:3},menu_ok:{g:1.44,max:2,rev:.15},menu_back:{g:1.1,max:2,rev:.15},firework:{g:.59,max:4,rev:.45},train_horn:{g:.92,max:1,rev:.35},respawn:{g:.83,max:1,rev:.25},wrong_way:{g:.81,max:1}};Object.keys(Th);var Oh=e=>typeof OfflineAudioContext<`u`&&e instanceof OfflineAudioContext;function kh(e){let t=Math.floor(e*.25),n=new Float32Array(t),r=Kf(515),i=new Q(`bp`,420,1.1,e),a=new Q(`hp`,2800,.7,e);for(let o=0;o<t;o++){let t=o/e,s=r()*2-1;n[o]=i.process(s)*Math.exp(-t/.03)*2.2+Math.sin(Hf*92*t)*Math.exp(-t/.045)*.8+a.process(s)*Math.exp(-t/.004)*.35}return Qf(n,e)}var Ah=class{constructor(e,t,{volume:n=1,pan:r=0}={},{level:i=.5,rev:a=.15}={}){this.ctx=e,this.level=i,this.vol=Uf(Wf(n,1),0,2),this.rate=1,this.alive=!0,this.srcs=[],this.nodes=[],this.timer=0,this.out=e.createGain(),this.panner=e.createStereoPanner(),this.panner.pan.value=Uf(Wf(r,0),-1,1),this.send=e.createGain(),this.send.gain.value=a,this.out.connect(this.panner).connect(t.dry),this.panner.connect(this.send).connect(t.wet);let o=e.currentTime;this.out.gain.setValueAtTime(0,o),this.out.gain.linearRampToValueAtTime(this.vol*i,o+.12)}node(e){return this.nodes.push(e),e}src(e){return this.srcs.push(e),e}setVolume(e){this.alive&&(this.vol=Uf(Wf(e,this.vol),0,2),this.out.gain.setTargetAtTime(this.vol*this.level,this.ctx.currentTime,.05))}setPan(e){this.alive&&this.panner.pan.setTargetAtTime(Uf(Wf(e,0),-1,1),this.ctx.currentTime,.05)}setRate(e){this.alive&&(this.rate=Uf(Wf(e,1),.25,3),this.onRate())}onRate(){}stop(e=.25){if(!this.alive)return;this.alive=!1,clearTimeout(this.timer);let t=this.ctx.currentTime,n=this.out.gain;n.cancelScheduledValues(t),n.setValueAtTime(n.value,t),n.linearRampToValueAtTime(0,t+e);for(let n of this.srcs)try{n.stop(t+e+.05)}catch{}this.onStop&&this.onStop(),setTimeout(()=>this.dispose(),(e+.3)*1e3)}dispose(){for(let e of[...this.nodes,...this.srcs,this.out,this.panner,this.send])try{e.disconnect()}catch{}}schedule(e,t=.25){if(Oh(this.ctx)){e(this.ctx.length/this.ctx.sampleRate);return}let n=()=>{this.alive&&(e(this.ctx.currentTime+t),this.timer=setTimeout(n,60))};n()}loopSrc(e,t=0,n=1){let r=this.ctx.createBufferSource();return r.buffer=e,r.loop=!0,r.playbackRate.value=n,r.start(this.ctx.currentTime,t),this.src(r)}gain(e){let t=this.ctx.createGain();return t.gain.value=e,this.node(t)}filter(e,t,n=.7){let r=this.ctx.createBiquadFilter();return r.type=e,r.frequency.value=t,r.Q.value=n,this.node(r)}oneShot(e,t,n,r){let i=this.ctx.createBufferSource();i.buffer=e,i.playbackRate.value=n;let a=this.ctx.createGain();a.gain.value=r,i.connect(a).connect(this.out),i.start(t),i.onended=()=>{i.disconnect(),a.disconnect()}}},jh={crossing_bell:class extends Ah{constructor(e,t,n){super(e,t,n,{level:.55,rev:.22});let r=e.sampleRate,i=wh.crossA(r),a=wh.crossB(r),o=e.currentTime+.02,s=0;this.schedule(e=>{for(;o<e;)this.oneShot(s++%2?a:i,o,1,.9),o+=.38/this.rate})}},train_run:class extends Ah{constructor(e,t,n){super(e,t,n,{level:.6,rev:.1});let r=e.sampleRate;this.rum=this.loopSrc(cp(r),.3),this.rumLp=this.filter(`lowpass`,170,.8),this.rum.connect(this.rumLp).connect(this.gain(.9)).connect(this.out),this.roar=this.loopSrc(sp(r),1.1),this.roarBp=this.filter(`bandpass`,650,.7),this.roar.connect(this.roarBp).connect(this.gain(.28)).connect(this.out),this.mot=this.src(e.createOscillator()),this.mot.type=`triangle`,this.mot.frequency.value=118,this.mot.connect(this.gain(.06)).connect(this.out),this.whine=this.src(e.createOscillator()),this.whine.type=`sawtooth`,this.whine.frequency.value=820,this.whine.connect(this.filter(`bandpass`,1100,3)).connect(this.gain(.016)).connect(this.out),this.mot.start(),this.whine.start();let i=ip(`fx:clack`,r,kh),a=[0,.12,.35,.47],o=e.currentTime+.05,s=0;this.schedule(e=>{for(;o+a[s]/this.rate<e;){let e=o+a[s]/this.rate;this.oneShot(i,e,.9+.1*this.rate,s%2?.75:.95),s++,s>=a.length&&(s=0,o+=1.05/this.rate)}}),this.onRate()}onRate(){let e=this.ctx.currentTime,t=this.rate;this.rum.playbackRate.setTargetAtTime(.8+.2*t,e,.2),this.roarBp.frequency.setTargetAtTime(450+250*t,e,.2),this.mot.frequency.setTargetAtTime(90+40*t,e,.3),this.whine.frequency.setTargetAtTime(500+380*t,e,.3)}},waterfall:class extends Ah{constructor(e,t,n){super(e,t,n,{level:.5,rev:.25});let r=e.sampleRate,i=this.filter(`lowpass`,2300,.6),a=this.filter(`highpass`,150,.6);i.connect(a).connect(this.out),this.a=this.loopSrc(sp(r),.2),this.b=this.loopSrc(sp(r),2.1);for(let[t,n]of[[this.a,-.7],[this.b,.7]]){let r=this.node(e.createStereoPanner());r.pan.value=n,t.connect(r).connect(i)}this.c=this.loopSrc(cp(r),1.3),this.c.connect(this.filter(`lowpass`,320,.7)).connect(this.gain(.7)).connect(this.out)}onRate(){let e=this.ctx.currentTime;for(let t of[this.a,this.b,this.c])t.playbackRate.setTargetAtTime(this.rate,e,.2)}},star_music:class extends Ah{constructor(e,t,n){super(e,t,n,{level:1,rev:0}),this.wet=this.gain(this.vol),this.wet.connect(t.wet),this.seq=new km(e,{dry:this.out,wet:this.wet},sh(`star`),{loop:!0,seed:3}),this.seq.start(e.currentTime+.03,.05)}setVolume(e){super.setVolume(e),this.alive&&this.wet.gain.setTargetAtTime(this.vol,this.ctx.currentTime,.05)}onRate(){this.seq.setRate(this.rate)}stop(e=.4){this.alive&&(this.seq.stop(e),super.stop(e))}}},Mh=Object.keys(jh);function Nh(e,t,n,r){let i=jh[e];return i?new i(t,n,r):null}var Ph=e=>typeof OfflineAudioContext<`u`&&e instanceof OfflineAudioContext,Fh=class{constructor(e,t){this.ctx=e,this.dest=t,this.n=null,this.stopTimer=0}start(e=this.ctx.currentTime){if(clearTimeout(this.stopTimer),this.n){this.n.vol.gain.cancelScheduledValues(e),this.n.vol.gain.setTargetAtTime(.2,e,.05),this.running=!0;return}let t=this.ctx,n=(e,n)=>{let r=t.createOscillator();return r.type=e,r.frequency.value=n,r},r=e=>{let n=t.createGain();return n.gain.value=e,n},i={};i.oA=n(`sawtooth`,45),i.oB=n(`square`,90.4),i.oC=n(`sine`,22.5),i.lfo=n(`sine`,22.5),i.gA=r(.5),i.gB=r(.16),i.gC=r(.55),i.lp=t.createBiquadFilter(),i.lp.type=`lowpass`,i.lp.frequency.value=600,i.lp.Q.value=1.3,i.am=r(.72),i.lfoG=r(.28),i.vol=r(0),i.oA.connect(i.gA).connect(i.lp),i.oB.connect(i.gB).connect(i.lp),i.oC.connect(i.gC).connect(i.lp),i.lp.connect(i.am).connect(i.vol).connect(this.dest),i.lfo.connect(i.lfoG).connect(i.am.gain),i.nz=t.createBufferSource(),i.nz.buffer=op(t.sampleRate),i.nz.loop=!0,i.offLp=t.createBiquadFilter(),i.offLp.type=`lowpass`,i.offLp.frequency.value=380,i.offG=r(0),i.jetBp=t.createBiquadFilter(),i.jetBp.type=`bandpass`,i.jetBp.frequency.value=1600,i.jetBp.Q.value=1.2,i.jetG=r(0),i.nz.connect(i.offLp).connect(i.offG).connect(i.vol),i.nz.connect(i.jetBp).connect(i.jetG).connect(i.vol);for(let t of[i.oA,i.oB,i.oC,i.lfo,i.nz])t.start(e);i.vol.gain.setValueAtTime(0,e),i.vol.gain.setTargetAtTime(.2,e,.06),this.n=i,this.running=!0,this.update({},e)}update(e={},t=this.ctx.currentTime){let n=this.n;if(!n||!this.running)return;let r=Uf(Wf(e.speed01,0),0,1.6),i=Uf(Wf(e.throttle,0),0,1),a=Uf(Wf(e.boost,0),0,1),o=Wf(e.airborne,0)>0,s=Wf(e.offroad,0)>0&&!o,c=r;o?c=Math.min(1.55,r+.25+.35*i):r<.15&&(c=Math.max(r,.55*i));let l=(42+80*c)*(1+.07*a),u=.06;n.oA.frequency.setTargetAtTime(l,t,u),n.oB.frequency.setTargetAtTime(l*2.004,t,u),n.oC.frequency.setTargetAtTime(l*.5,t,u),n.lfo.frequency.setTargetAtTime(l*.5,t,u);let d=Uf(420+1500*c*(.45+.55*i)+500*a-(s?150:0),250,3600);n.lp.frequency.setTargetAtTime(d,t,.08),n.lfoG.gain.setTargetAtTime(s?.4:.26,t,.1),n.vol.gain.setTargetAtTime(.13+.08*i+.06*Math.min(1,c),t,.08),n.offG.gain.setTargetAtTime(s?.5*Math.min(1,r*2):0,t,.1),n.jetBp.frequency.setTargetAtTime(1300+900*Math.min(1.6,r),t,.1),n.jetG.gain.setTargetAtTime(a?.35:0,t,a?.04:.2)}stop(e=this.ctx.currentTime){let t=this.n;if(!t||!this.running)return;this.running=!1,t.vol.gain.cancelScheduledValues(e),t.vol.gain.setTargetAtTime(0,e,.05);let n=()=>{if(!(this.running||this.n!==t)){for(let e of[t.oA,t.oB,t.oC,t.lfo,t.nz])try{e.stop()}catch{}for(let e in t)try{t[e].disconnect()}catch{}this.n=null}};if(Ph(this.ctx))for(let n of[t.oA,t.oB,t.oC,t.lfo,t.nz])n.stop(e+.4);else this.stopTimer=setTimeout(n,450)}};function Ih(e){let t=Math.floor(e*2),n=new Float32Array(t),r=Kf(313);for(let e=0;e<520;e++){let e=Math.floor(r()*t),i=r()<.12?1:.25+r()*.35,a=8+Math.floor(r()*60);for(let o=0;o<a;o++)n[(e+o)%t]+=(r()*2-1)*i*Math.exp(-o/(a*.25))}return new Q(`hp`,1500,.7,e).run(n),Xf(n,.8)}var Lh=class{constructor(e,t){this.ctx=e,this.dest=t,this.n=null,this.idleSince=null,this.r=Kf(77)}_build(e){let t=this.ctx,n=e=>{let n=t.createGain();return n.gain.value=e,n},r=(e,n,r)=>{let i=t.createBiquadFilter();return i.type=e,i.frequency.value=n,i.Q.value=r,i},i={};i.nz=t.createBufferSource(),i.nz.buffer=op(t.sampleRate),i.nz.loop=!0,i.bp1=r(`bandpass`,1250,8),i.bp2=r(`bandpass`,2520,11),i.g2=n(.6),i.sq=n(0),i.nz.connect(i.bp1).connect(i.sq),i.nz.connect(i.bp2).connect(i.g2).connect(i.sq),i.sq.connect(this.dest),i.sp=t.createBufferSource(),i.sp.buffer=ip(`fx:sparks`,t.sampleRate,Ih),i.sp.loop=!0,i.hp=r(`highpass`,2e3,.7),i.lp=r(`lowpass`,8500,.7),i.spG=n(0),i.sp.connect(i.hp).connect(i.lp).connect(i.spG).connect(this.dest),i.nz.start(e,this.r()*3),i.sp.start(e,this.r()*2),this.n=i}update(e,t,n=this.ctx.currentTime){let r=!!e&&Wf(t,0)>=0,i=Uf(Math.round(Wf(t,0)),0,3);r&&!this.n&&this._build(n);let a=this.n;if(a){if(r){this.idleSince=null;let e=1+(this.r()-.5)*.07;a.bp1.frequency.setTargetAtTime(1250*(1+.05*i)*e,n,.04),a.bp2.frequency.setTargetAtTime(2520*(1+.05*i)/e,n,.04),a.sq.gain.setTargetAtTime(.9,n,.05),a.spG.gain.setTargetAtTime([0,.15,.21,.27][i],n,.05),a.sp.playbackRate.setTargetAtTime(.85+.2*i,n,.1),a.hp.frequency.setTargetAtTime(1600+800*i,n,.1)}else a.sq.gain.setTargetAtTime(0,n,.06),a.spG.gain.setTargetAtTime(0,n,.04),this.idleSince===null?this.idleSince=n:n-this.idleSince>.5&&this.dispose(n)}}dispose(e=this.ctx.currentTime){let t=this.n;if(t){this.n=null,this.idleSince=null;try{t.nz.stop(e+.05),t.sp.stop(e+.05)}catch{}Ph(this.ctx)||setTimeout(()=>{for(let e in t)try{t[e].disconnect()}catch{}},200)}}},Rh=e=>typeof OfflineAudioContext<`u`&&e instanceof OfflineAudioContext,zh=22050;function Bh(e,t){let n=Kf(t),r=900+n()*1300,i=80+n()*110,a=3+Math.floor(n()*6),o=5+n()*4,s=.035+n()*.03,c=Math.floor((a/o+.12)*e),l=new Float32Array(c);for(let t=0;t<a;t++){let n=Math.floor(t/o*e),u=Math.floor(s*e),d=.6+.4*Math.sin((t+.5)/a*Math.PI);for(let t=0;t<u&&n+t<c;t++){let a=t/e,o=Math.min(1,a/.004)*Math.exp(-a/(s*.45)),c=Math.exp(-(a*i%1)*5);l[n+t]+=Math.sin(Hf*r*(a-.05*a*a/s))*c*o*d}}return new Q(`bp`,r,1.5,e).run(l),Qf(l,e,{fade:.02})}function Vh(e,t){let n=Kf(t),r=5.5+n()*1.5,i=Math.floor(r*e),a=new Float32Array(i),o=4100+n()*500,s=.05,c=0;for(;s<r-.25;){let t=s/r,n=.085+.025*t,l=o*(c%2?.9:1),u=Math.min(1,s/.5)*(1-.8*t),d=Math.floor(s*e),f=Math.floor(n*e);for(let t=0;t<f&&d+t<i;t++){let r=t/e,i=Math.min(1,r/.006)*Math.exp(-r/(n*.5)),o=.55+.45*Math.sin(Hf*190*r);a[d+t]+=Math.sin(Hf*l*(r-.035*r*r/n))*i*o*u}s+=.115+.065*t,c++}return new Q(`lp`,6500,.7,e).run(a),Qf(a,e,{fade:.1})}function Hh(e,t,n,r=.1){let i=Math.floor(n*e),a=new Float32Array(i);for(let[n,o,s,c,l,u=.2,d=0]of t){let t=Math.floor(n*e),f=Math.floor(o*e),p=0;for(let n=0;n<f&&t+n<i;n++){let i=n/f,o=n/e,m=s*(c/s)**+i*(1+.004*Math.sin(Hf*6*o));p+=Hf*m/e;let h=Math.min(1,i/u)*Math.min(1,(1-i)/.15),g=d?.55+.45*Math.sin(Hf*d*o):1;a[t+n]+=(Math.sin(p)+r*Math.sin(2*p))*h*l*g}}return Qf(a,e,{fade:.02})}var Uh=e=>Hh(e,[[0,1.1,1150,1260,.75,.3],[1.26,.12,1520,1420,.9,.2],[1.4,.09,2300,3800,1,.3],[1.51,.32,3500,2e3,1,.1,32]],1.95),Wh=e=>{let t=[[0,.9,1180,1300,.7,.3],[1.02,.1,1550,1450,.85,.2],[1.14,.08,2400,3900,1,.3],[1.24,.26,3600,2100,1,.1,30]];for(let e=0;e<4;e++){let n=1.75+e*.26;t.push([n,.07,2500,3700,.8-e*.1,.3],[n+.08,.13,3400,2300,.8-e*.1,.15])}return Hh(e,t,2.95)},Gh=(e,t)=>Hh(e,[[0,.06+t*.01,5200-t*400,3500-t*200,1,.15,110]],.1,.25),Kh=e=>Hh(e,[[0,.28,2700,3300,.9,.2],[.3,.22,3200,2300,1,.1]],.56,.22);function qh(e){let t=Math.floor(e*1.3),n=new Float32Array(t),r=new Q(`bp`,1300,3,e),i=new Q(`bp`,2300,4,e);for(let[t,r]of[[0,1],[.6,.85]]){let i=Math.floor(t*e),a=Math.floor(.42*e),o=0;for(let t=0;t<a;t++){let s=t/a;o+=(520-90*s)/e,o-=Math.floor(o),n[i+t]+=(2*o-1)*Math.min(1,s/.08)*Math.min(1,(1-s)/.3)*r}}for(let e=0;e<t;e++){let t=n[e];n[e]=r.process(t)+.6*i.process(t)}return Qf(n,e,{fade:.05})}function Jh(e){let t=Math.floor(e*1.5),n=new Float32Array(t);for(let t=0;t<3;t++){let r=Math.floor(t*.5*e),i=Math.floor(.34*e);for(let t=0;t<i;t++){let a=t/e,o=t/i;n[r+t]+=Math.sin(Hf*4400*a)*(.6+.4*Math.sin(Hf*42*a))*Math.min(1,o/.1)*Math.min(1,(1-o)/.2)}}return Qf(n,e,{fade:.02})}function Yh(e){let t=Math.floor(6.4*e),n=Kf(4040),r=ep(t,n),i=ep(t,n);new Q(`bp`,1100,.5,e).run(r),new Q(`bp`,1300,.5,e).run(i);for(let e=0;e<t;e++)r[e]*=.5,i[e]*=.5;for(let a=0;a<512;a++){let a=Math.floor(n()*t),o=500+n()*1800,s=.012+n()*.03,c=1.3+n()*.5,l=.1+n()*.3,u=n(),d=Math.floor(s*e),f=0;for(let n=0;n<d&&a+n<t;n++){let t=n/d;f+=Hf*o*(1+(c-1)*t)/e;let s=Math.sin(f)*l*Math.min(1,t/.1)*(1-t);r[a+n]+=s*(1-u),i[a+n]+=s*u}}return Xf(np([r,i],e,.4),.7)}var Xh=[[800,1250],[300,2200],[340,1300],[500,1900],[500,850]];function Zh(e){let t=8.5,n=Math.floor(t*e),r=Kf(5050),i=new Float32Array(n),a=new Float32Array(n);for(let o=0;o<14;o++){let o=r(),s=100+r()*150,c=.4+r()*.6,l=new Q(`bp`,500,5,e),u=new Q(`bp`,1500,7,e),d=r()*.5,f=0;for(;d<t;){if(r()<.22){d+=.2+r()*.8;continue}let t=.1+r()*.14,[p,m]=Xh[Math.floor(r()*5)],h=.9+r()*.2;l.set(p*h,5),u.set(m*h,7);let g=Math.floor(d*e),_=Math.floor(t*e),v=s*(.9+r()*.25);for(let t=0;t<_&&g+t<n;t++){f+=v/e,f-=Math.floor(f);let n=(2*f-1)*.7+(r()*2-1)*.3,s=Math.sin(Math.PI*t/_)*c,d=(l.process(n)+.6*u.process(n))*s;i[g+t]+=d*(1-o*.8),a[g+t]+=d*(.2+o*.8)}d+=t+r()*.05}}return new Q(`lp`,2800,.7,e).run(i),new Q(`lp`,2800,.7,e).run(a),Xf(np([i,a],e,.5),.7)}var Qh={frog:(e,t)=>ip(`amb:frog`+t,e,e=>Bh(e,100+t)),higu:(e,t)=>ip(`amb:higu`+t,e,e=>Vh(e,200+t)),uguA:e=>ip(`amb:uguA`,e,Uh),uguB:e=>ip(`amb:uguB`,e,Wh),sparrow:(e,t)=>ip(`amb:sparrow`+t,e,e=>Gh(e,t)),bulbul:e=>ip(`amb:bulbul`,e,Kh),crow:e=>ip(`amb:crow`,e,qh),suzu:e=>ip(`amb:suzu`,e,Jh),stream:()=>ip(`amb:stream`,zh,Yh),crowd:()=>ip(`amb:crowd`,zh,Zh)},$h=[74,77,79,81,84,86],eg={inaka:{beds:e=>{e.wind(.6,520)},ev:{frog:[.12,.5,(e,t)=>e.shot(Qh.frog(e.sr,e.ri(6)),t,.85+e.r()*.4,.06+e.r()*.11,e.r()*1.8-.9,e.r()<.5)],higurashi:[5,12,(e,t)=>e.shot(Qh.higu(e.sr,e.ri(3)),t,.97+e.r()*.06,.07+e.r()*.05,e.r()*1.6-.8)],crow:[14,30,(e,t)=>e.shot(Qh.crow(e.sr),t,.9+e.r()*.2,.09,e.r()*1.4-.7,!0)]}},sakura:{beds:e=>{e.wind(.35,750,!0),e.bed(Qh.stream(),.2,-.45)},ev:{uguisu:[7,15,(e,t)=>e.shot(e.r()<.65?Qh.uguA(e.sr):Qh.uguB(e.sr),t,.96+e.r()*.08,.13+e.r()*.05,e.r()*1.6-.8)],sparrow:[1.5,5,(e,t)=>{let n=e.r()*1.6-.8,r=e.ri(3);for(let i=0,a=2+e.ri(3);i<a;i++)e.shot(Qh.sparrow(e.sr,r),t+i*(.12+e.r()*.15),.95+e.r()*.1,.035,n)}],bulbul:[12,24,(e,t)=>e.shot(Qh.bulbul(e.sr),t,.95+e.r()*.1,.045,e.r()*1.6-.8,!0)]}},matsuri:{beds:e=>{e.bed(Qh.crowd(),.12,0),e.wind(.12,400)},ev:{taiko:[5,11,(e,t)=>{for(let[n,r,i]of[[0,`taiko`,1],[.36,`taiko`,.8],[.72,`taiko`,1],[.9,`taikoKa`,.7],[1.08,`taikoKa`,.7],[1.44,`taiko`,1]])lm(e.ctx,e.far,r,t+n,i*.12)}],flute:[9,18,(e,t)=>{let n=t;for(let t=0,r=4+e.ri(4);t<r;t++){let t=[.2,.4,.6][e.ri(3)];cm(e.ctx,e.far,`flute`,n,$h[e.ri($h.length)],t,.12),n+=t}}],fireworks:[7,15,(e,t)=>{e.boom(t,.15),e.shot(wh.crackle(e.sr),t+.25,.9+e.r()*.2,.05,e.r()*1.4-.7,!0)}],suzumushi:[4,9,(e,t)=>e.shot(Qh.suzu(e.sr),t,.98+e.r()*.05,.018,e.r()*1.8-.9)],furin:[8,16,(e,t)=>{let n=e.r()*1.4-.7;for(let r=0,i=2+e.ri(2);r<i;r++)e.shot(Cp(`glock`,96+e.ri(5),e.sr),t+r*(.15+e.r()*.2),1,.05,n)}]}}},tg=Object.keys(eg);function ng(e,t){return{inaka:[...[0,1,2,3,4,5].map(e=>()=>Qh.frog(t,e)),...[0,1,2].map(e=>()=>Qh.higu(t,e)),()=>Qh.crow(t),()=>sp(t)],sakura:[()=>Qh.uguA(t),()=>Qh.uguB(t),...[0,1,2].map(e=>()=>Qh.sparrow(t,e)),()=>Qh.bulbul(t),()=>Qh.stream(),()=>sp(t),()=>op(t)],matsuri:[()=>Qh.crowd(),()=>Qh.suzu(t),()=>wh.crackle(t),()=>sp(t)]}[e]||[]}var rg=class{constructor(e,t,n,{seed:r=1}={}){this.ctx=e,this.sr=e.sampleRate,this.def=eg[n],this.id=n,this.r=Kf(r*7+n.length),this.alive=!0,this.srcs=[],this.nodes=[],this.timer=0,this.out=this._g(0),this.out.connect(t.dry);let i=this._g(.25);this.out.connect(i).connect(t.wet),this.far=this.ctx.createBiquadFilter(),this.far.type=`lowpass`,this.far.frequency.value=1500,this.nodes.push(this.far),this.far.connect(this.out),this.far.connect(this._g(.9)).connect(t.wet)}ri(e){return Math.floor(this.r()*e)}_g(e){let t=this.ctx.createGain();return t.gain.value=e,this.nodes.push(t),t}start(e=1.5){if(!this.def)return this;let t=this.ctx.currentTime;this.out.gain.setValueAtTime(0,t),this.out.gain.linearRampToValueAtTime(1,t+e),this.def.beds(this),this.next={};for(let e in this.def.ev)this.next[e]=t+.3+this.r()*this.def.ev[e][1]*.5;return Rh(this.ctx)?this.scheduleUntil(this.ctx.length/this.sr):this._tick(),this}_tick(){this.alive&&(this.scheduleUntil(this.ctx.currentTime+.4),this.timer=setTimeout(()=>this._tick(),150))}scheduleUntil(e){for(let t in this.def.ev){let[n,r,i]=this.def.ev[t],a=0;for(;this.next[t]<e&&a++<1e3;)i(this,this.next[t]),this.next[t]+=n+this.r()*(r-n)}this.gust&&this.gust(e)}stop(e=1.2){if(!this.alive)return;this.alive=!1,clearTimeout(this.timer);let t=this.ctx.currentTime,n=this.out.gain;n.cancelScheduledValues(t),n.setValueAtTime(n.value,t),n.linearRampToValueAtTime(0,t+e);for(let n of this.srcs)try{n.stop(t+e+.05)}catch{}setTimeout(()=>{for(let e of[...this.nodes,...this.srcs])try{e.disconnect()}catch{}},(e+.4)*1e3)}shot(e,t,n,r,i=0,a=!1){if(!e)return;let o=this.ctx,s=o.createBufferSource();s.buffer=e,s.playbackRate.value=n;let c=o.createGain();c.gain.value=r;let l=o.createStereoPanner();l.pan.value=Uf(i,-1,1),s.connect(c).connect(l).connect(a?this.far:this.out),s.start(t),s.onended=()=>{s.disconnect(),c.disconnect(),l.disconnect()}}bed(e,t,n=0){let r=this.ctx.createBufferSource();r.buffer=e,r.loop=!0;let i=this._g(t),a=this.ctx.createStereoPanner();a.pan.value=n,this.nodes.push(a),r.connect(i).connect(a).connect(this.out),r.start(this.ctx.currentTime,this.r()*e.duration),this.srcs.push(r)}wind(e,t,n=!1){let r=this.ctx,i=r.createBufferSource();i.buffer=sp(this.sr),i.loop=!0;let a=r.createBiquadFilter();a.type=`lowpass`,a.frequency.value=t,a.Q.value=.9;let o=this._g(e*.6);this.nodes.push(a),i.connect(a).connect(o).connect(this.out),i.start(r.currentTime,this.r()*3),this.srcs.push(i);let s=null;if(n){let e=r.createBufferSource();e.buffer=op(this.sr),e.loop=!0;let t=r.createBiquadFilter();t.type=`highpass`,t.frequency.value=2800,s=this._g(0),this.nodes.push(t),e.connect(t).connect(s).connect(this.out),e.start(r.currentTime,this.r()*3),this.srcs.push(e)}let c=r.currentTime;this.gust=n=>{for(;c<n;){let n=this.r();a.frequency.setTargetAtTime(t*(.6+.9*n),c,.8),o.gain.setTargetAtTime(e*(.35+.65*n),c,.9),s&&s.gain.setTargetAtTime(.02*n*n,c,.6),c+=1.5+this.r()*2.5}}}boom(e,t){let n=this.ctx,r=n.createOscillator();r.frequency.setValueAtTime(60,e),r.frequency.exponentialRampToValueAtTime(32,e+.5);let i=n.createGain();i.gain.setValueAtTime(0,e),i.gain.linearRampToValueAtTime(t,e+.01),i.gain.setTargetAtTime(0,e+.01,.25),r.connect(i).connect(this.far),r.start(e),r.stop(e+1.5),r.onended=()=>{r.disconnect(),i.disconnect()}}},ig=Object.freeze({setVolume(){},setPan(){},setRate(){},stop(){}}),ag=0;function og(e,t){ag++<8&&console.warn(`[audio] `+e+`:`,t)}var sg=class{constructor(){this.ctx=null,this.mix=null,this.vol={...up},this.music=null,this.musicId=null,this.finalLap=!1,this.jingleUntil=0,this.stars=new Set,this.loops=new Set,this.amb=null,this.ambId=null,this.engine=null,this.drift=null,this.voices=[],this.rand=Kf(1234),this.pendingMusic=null,this.pendingAmb=null,this._ducked=!1,this._janitor=0,this._seed=1,this._engineWanted=!1,this._warmJobs=[],this._warmTimer=0,this._pump=this._pump.bind(this)}async unlock(){try{if(!this.ctx){let e=typeof window<`u`&&(window.AudioContext||window.webkitAudioContext);if(!e)return!1;this.ctx=new e({latencyHint:`interactive`}),this.mix=hp(this.ctx,this.ctx.destination,this.vol),this.engine=new Fh(this.ctx,this.mix.sfx.dry),this.drift=new Lh(this.ctx,this.mix.sfx.dry),this._janitor=setInterval(()=>this._reap(),2e3),this._warmup()}this.ctx.state!==`running`&&await this.ctx.resume()}catch(e){og(`unlock`,e)}try{if(this.pendingMusic&&!this.music){let e=this.pendingMusic;this.pendingMusic=null,this.playMusic(e.id,e.opts)}if(this.pendingAmb&&!this.amb){let e=this.pendingAmb;this.pendingAmb=null,this.playAmbience(e)}}catch(e){og(`unlock/pending`,e)}return this.ready}get ready(){return!!this.ctx&&this.ctx.state===`running`}setVolume(e){try{for(let t of[`master`,`music`,`sfx`])e&&e[t]!==void 0&&(this.vol[t]=Uf(Wf(e[t],this.vol[t]),0,1));this.mix&&this.mix.setVolume(this.vol)}catch(e){og(`setVolume`,e)}}playMusic(e,t){try{let{fadeIn:n=.6}=t||{};if(!rh.includes(e))return;if(!this.ctx){this.pendingMusic={id:e,opts:{fadeIn:n}};return}if(this.music&&this.musicId===e)return;let r=sh(e);this._warmSong(r,!0),this.music&&this.music.stop(.5),this.finalLap=!1,this.music=new km(this.ctx,this.mix.music,r,{loop:!0,seed:this._seed++}),this.music.start(this.ctx.currentTime+.06,Uf(Wf(n,.6),0,10)),this.musicId=e}catch(e){og(`playMusic`,e)}}stopMusic(e){try{let{fadeOut:t=.8}=e||{};this.pendingMusic=null,this.music&&this.music.stop(Uf(Wf(t,.8),.02,10)),this.music=null,this.musicId=null}catch(e){og(`stopMusic`,e)}}setFinalLap(e){try{this.finalLap=!!e,this.music&&this.music.setFinal(this.finalLap)}catch(e){og(`setFinalLap`,e)}}playJingle(e){try{if(!this.ready||!ih.includes(e))return;let t=sh(e),n=this.ctx,r=n.currentTime+.03,i=new km(n,this.mix.jingle,t,{loop:!1,seed:this._seed++});i.start(r,0);let a=r+t.endSec+.15;this.jingleUntil=Math.max(this.jingleUntil,a),this._applyDuck(),setTimeout(()=>this._applyDuck(),(a-n.currentTime)*1e3+40),setTimeout(()=>i.dispose(),(a-n.currentTime+3)*1e3)}catch(e){og(`playJingle`,e)}}_applyDuck(){if(!this.mix)return;let e=this.stars.size>0||this.jingleUntil>this.ctx.currentTime+.02;e!==this._ducked&&(this._ducked=e,this.mix.duck(e))}playAmbience(e){try{if(!tg.includes(e)){this.stopAmbience();return}if(!this.ctx){this.pendingAmb=e;return}if(this.amb&&this.ambId===e)return;this.stopAmbience(),this.amb=new rg(this.ctx,this.mix.amb,e,{seed:this._seed++}).start(1.5),this.ambId=e}catch(e){og(`playAmbience`,e)}}stopAmbience(){try{this.pendingAmb=null,this.amb&&this.amb.stop(1),this.amb=null,this.ambId=null}catch(e){og(`stopAmbience`,e)}}engineStart(){try{this._engineWanted=!0,this.ready&&this.engine.start()}catch(e){og(`engineStart`,e)}}engineStop(){try{this._engineWanted=!1,this.engine&&this.engine.stop()}catch(e){og(`engineStop`,e)}}engineUpdate(e){try{if(!this.ready||!e||typeof e!=`object`)return;this._engineWanted&&!this.engine.running&&this.engine.start(),this.engine.update(e)}catch(e){og(`engineUpdate`,e)}}driftUpdate(e,t){try{if(!this.drift)return;if(!this.ready){this.drift.dispose();return}this.drift.update(e,t)}catch(e){og(`driftUpdate`,e)}}play(e,t){try{let{volume:n=1,pan:r=0,pitch:i=1}=t||{};if(!this.ready)return;let a=Th[e];if(!a)return;let o=Dh[e]||{},s=this.ctx,c=s.currentTime,l=Uf(Wf(n,1),0,2);if(l<=.001)return;this._reap();let u=this.voices.filter(t=>t.name===e&&!t.stolen&&t.end>c);u.length>=(o.max||4)&&this._steal(u[0],c);let d=this.voices.filter(e=>!e.stolen&&e.end>c);d.length>=32&&this._steal(d[0],c);let f=s.createGain();f.gain.value=l*(o.g??.7);let p=s.createStereoPanner();p.pan.value=Uf(Wf(r,0),-1,1),f.connect(p).connect(this.mix.sfx.dry);let m=null;o.rev&&(m=s.createGain(),m.gain.value=o.rev,p.connect(m).connect(this.mix.sfx.wet));let h={ctx:s,out:f,t:c+.005,p:Uf(Wf(i,1),.25,4),r:this.rand,srcs:[]},g=a(h);this.voices.push({name:e,out:f,pn:p,sg:m,srcs:h.srcs,end:Wf(g,c+2),stolen:!1})}catch(t){og(`play `+e,t)}}_steal(e,t){e.stolen=!0,e.out.gain.cancelScheduledValues(t),e.out.gain.setTargetAtTime(0,t,.008);for(let n of e.srcs)try{n.stop(t+.05)}catch{}e.end=t}_reap(){if(!this.ctx)return;let e=this.ctx.currentTime;this.voices=this.voices.filter(t=>{if(t.end+.25<e){for(let e of[t.out,t.pn,t.sg])if(e)try{e.disconnect()}catch{}return!1}return!0})}startLoop(e,t){try{let{volume:n=1,pan:r=0}=t||{};if(!this.ready||!Mh.includes(e))return ig;let i=e===`star_music`,a=Nh(e,this.ctx,i?this.mix.jingle:this.mix.sfx,{volume:n,pan:r});return a?(this.loops.add(a),i&&this.stars.add(a),a.onStop=()=>{this.loops.delete(a),this.stars.delete(a),this._applyDuck()},this._applyDuck(),{setVolume:e=>{try{a.setVolume(e)}catch(e){og(`loop.setVolume`,e)}},setPan:e=>{try{a.setPan(e)}catch(e){og(`loop.setPan`,e)}},setRate:e=>{try{a.setRate(e)}catch(e){og(`loop.setRate`,e)}},stop:()=>{try{a.stop()}catch(e){og(`loop.stop`,e)}}}):ig}catch(t){return og(`startLoop `+e,t),ig}}_warmup(){let e=this.ctx.sampleRate;this._queue(qp.map(t=>()=>Jp(t,e)));for(let e of[`title`,`select`,`start`,`final_lap`,`finish_win`,`finish_lose`,`star`,`inaka`,`sakura`,`matsuri`,`results`])this._warmSong(sh(e));this._queue([()=>wh.kanedarai(e),()=>wh.crackle(e)]);for(let t of tg)this._queue(ng(t,e))}_warmSong(e,t=!1){if(!e||!this.ctx)return;let n=this.ctx.sampleRate;this._queue(e.notesUsed.map(([e,t])=>()=>Cp(e,t,n)),t)}_queue(e,t=!1){t?this._warmJobs.unshift(...e):this._warmJobs.push(...e),this._warmTimer||=setTimeout(this._pump,30)}_pump(){this._warmTimer=0;let e=performance.now();for(;this._warmJobs.length&&performance.now()-e<6;)try{this._warmJobs.shift()()}catch(e){og(`warmup`,e)}this._warmJobs.length&&(this._warmTimer=setTimeout(this._pump,20))}};function cg(e,t){try{return t()}catch(t){return console.warn(`[main] ${e} unavailable`,t),null}}async function lg(){let e=document.getElementById(`app`),t=new URLSearchParams(location.search),n=t.get(`nokart`)?null:{createKartModel:qu,createGlider:gl},r=t.get(`noui`)?null:cg(`UI`,()=>new Vf(document.body)),i=t.get(`noaudio`)?null:cg(`audio`,()=>new sg),a=new ts(e,{ui:r,audio:i,stages:zc,characters:Wc,kartApi:n,itemApi:Yu});if(window.__game=a,a.devFlags={autopilot:!!t.get(`autopilot`),laps:t.get(`laps`)?parseInt(t.get(`laps`),10):null},t.get(`timescale`)&&(a.timeScale=parseFloat(t.get(`timescale`))),t.get(`quality`)&&(a.quality=t.get(`quality`)),t.get(`events`)){window.__events=[];let e=a._playerEvent.bind(a);a._playerEvent=(t,n)=>{window.__events.push(`${(a.race?a.race.time:0).toFixed(1)}:${n.type}${n.kind?`:`+n.kind:``}${n.level?`:`+n.level:``}`),e(t,n)}}let o=document.getElementById(`dbg`);if(t.get(`debug`)){let e=0,t=0,n=0;a.debug=r=>{e+=r,t++,e>.5&&(n=t/e,e=0,t=0);let i=a.race&&a.race.player;i&&(o.textContent=`fps ${n.toFixed(0)} pr ${a.renderer.pixelRatio.toFixed(2)}\nspd ${(i.speed*3.6).toFixed(0)} s ${i.s.toFixed(0)} lap ${i.lapCount} pos ${i.position} surf ${i.surface} ${i.grounded?`G`:`AIR`} drift ${i.drift.active?i.drift.level:`-`} boost ${i.boostT.toFixed(1)} glide ${i.glide.active} item ${i.item||`-`}`)}}if(t.get(`log`)){window.__log=[];let e=0,t=a.debug;a.debug=n=>{t&&t(n);let r=a.race;if(!r||r.time<e)return;e=r.time+.5;let i=r.player;window.__log.push([+r.time.toFixed(1),Math.round(i.s),+i.proj.d.toFixed(1),+i.pos.y.toFixed(1),Math.round(i.speed*3.6),i.surface,i.grounded?`G`:i.glide.active?`GLIDE`:`AIR`,i.lapCount,i.position].join(` `))}}if(t.get(`race`)||!r){let e={courseId:t.get(`race`)||zc[0].id,characterId:t.get(`char`)||`tanuki`,difficulty:t.get(`cc`)||`100cc`};if(i){let e=()=>{i.unlock().then(()=>{a.mode===`racing`&&i.playMusic(a.def.bgm||a.def.id),i.playAmbience(a.def.ambience||a.def.id)}),window.removeEventListener(`keydown`,e),window.removeEventListener(`pointerdown`,e)};window.addEventListener(`keydown`,e),window.addEventListener(`pointerdown`,e)}if(await a.loadRace(e),a._lastOpts=e,t.get(`at`)){let[e,n]=t.get(`at`).split(`,`).map(Number);a.race.player.place(e,n||0)}if((t.get(`skipintro`)||t.get(`at`))&&a._skipIntro(),t.get(`view`)){let e=t.get(`view`).split(`,`).map(Number);a.rig.playCinematic([{from:e.slice(0,3),to:e.slice(0,3),look:e.slice(3,6),dur:1e9,fov:e[6]||55}])}t.get(`freeze`)&&a.race.karts.forEach(e=>e.frozen=!0);return}if(i){let e=()=>{i.unlock(),window.removeEventListener(`pointerdown`,e,!0),window.removeEventListener(`keydown`,e,!0)};window.addEventListener(`pointerdown`,e,!0),window.addEventListener(`keydown`,e,!0)}Uc(a,{ui:r,audio:i,characters:Wc,stages:zc})}lg();export{Na as a,La as c,Wc as i,Zt as l,Ju as n,Ma as o,Jc as r,Ia as s,Pd as t,Gi as u};