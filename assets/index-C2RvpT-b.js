(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function n(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(r){if(r.ep)return;r.ep=!0;const a=n(r);fetch(r.href,a)}})();const ie=""+new URL("logo-DW9Q4-HK.png",import.meta.url).href;function Z(t,e){return e}const ee={width:Z(void 0,1280),height:Z(void 0,720)},b={imageAdjust:{brightness:0,contrast:0,saturation:0,hslSatRed:0,hslSatOrange:0,hslSatYellow:0,hslSatGreen:0,hslSatCyan:0,hslSatBlue:0,hslSatViolet:0,hslSatMagenta:0,sharpen:0},digicam:{isoGain:100,flashThreshold:1,flashBloomRadius:1,sensorProfile:"sony_ccd_v1",chromaAberration:0,lumaGrain:0},vhs:{trackingJitter:0,barrelDistortion:0,magneticNoise:0,colorBleed:0,scanlineIntensity:0,chromaDelay:0,syncDrift:0,headSwitching:0,dropouts:0,tapeDamage:0},compression:{jpegQuality:1,blockinessSize:4,ditheringType:"bayer_4x4",posterizationLevels:16,blockCorruption:0,blockCorruptionShift:0},brand:{gradeAmount:0,dirtAmount:0,scratchesAmount:0,dustAmount:0,crtAmount:0,crtCurvature:0,crtScanlines:0,crtMask:0,crtVignette:0,crtHalation:0,crtConvergence:0,crtCompensation:0},datamosh:{amount:0,motionThreshold:0,blockSize:4,feedback:0},output:{aspectRatio:"original"}};function be(){return{imageAdjust:{...b.imageAdjust},digicam:{...b.digicam},vhs:{...b.vhs},compression:{...b.compression},brand:{...b.brand},datamosh:{...b.datamosh},output:{...b.output}}}var G=typeof Float32Array<"u"?Float32Array:Array;Math.hypot||(Math.hypot=function(){for(var t=0,e=arguments.length;e--;)t+=arguments[e]*arguments[e];return Math.sqrt(t)});function xe(){var t=new G(2);return G!=Float32Array&&(t[0]=0,t[1]=0),t}function _e(t,e){var n=new G(2);return n[0]=t,n[1]=e,n}(function(){var t=xe();return function(e,n,o,r,a,s){var l,c;for(n||(n=2),o||(o=0),r?c=Math.min(r*n+o,e.length):c=e.length,l=o;l<c;l+=n)t[0]=e[l],t[1]=e[l+1],a(t,t,s),e[l]=t[0],e[l+1]=t[1];return e}})();const Se=55,Ee=58.5,Ae=30,ye=180,Te=.85,Re=1.1,we=320;function ae(t,e){if(t.width<=0||t.height<=0)return{width:e.width,height:e.height};const n=Math.min(1,e.width/t.width,e.height/t.height);return{width:Math.max(1,Math.round(t.width*n)),height:Math.max(1,Math.round(t.height*n))}}class Ce{scale=1;slowFrames=0;fastFrames=0;update(e,n,o){e>0&&e<Se?(this.slowFrames+=1,this.fastFrames=0):e>=Ee?(this.fastFrames+=1,this.slowFrames=0):(this.slowFrames=0,this.fastFrames=0);const r=ae(n,o),a=r.width>0?Math.min(1,we/r.width):1;return this.slowFrames>=Ae?(this.scale=Math.min(1,Math.max(a,this.scale*Te)),this.slowFrames=0):this.fastFrames>=ye&&(this.scale=Math.min(1,this.scale*Re),this.fastFrames=0),{width:Math.max(1,Math.round(r.width*this.scale)),height:Math.max(1,Math.round(r.height*this.scale))}}reset(){this.scale=1,this.slowFrames=0,this.fastFrames=0}}const Fe=[{extension:"jpg",mimeTypes:["image/jpeg","image/jpg"],kind:"image"},{extension:"jpeg",mimeTypes:["image/jpeg","image/jpg"],kind:"image"},{extension:"png",mimeTypes:["image/png"],kind:"image"},{extension:"mp4",mimeTypes:["video/mp4"],kind:"video"}],ke=".jpg,.jpeg,.png,.mp4",Ue="JPG, PNG o MP4";function De(t){const e=t.name.toLowerCase(),n=e.lastIndexOf("."),o=n<0?"":e.slice(n+1),r=Fe.find(s=>s.extension===o);if(r===void 0)throw new Error(`Formato no soportado: usa ${Ue}`);const a=t.type.trim().toLowerCase();if(a!==""&&a!=="application/octet-stream"&&!r.mimeTypes.includes(a))throw new Error(`El tipo "${a}" no coincide con la extensión .${o}`);return{extension:r.extension,kind:r.kind}}const Le={mimeType:"image/png"};function Be(){if(typeof MediaRecorder>"u")return[];const t=[];return["video/mp4;codecs=avc1.42E01E","video/mp4"].some(o=>MediaRecorder.isTypeSupported(o))&&t.push("mp4"),["video/webm;codecs=vp9","video/webm"].some(o=>MediaRecorder.isTypeSupported(o))&&t.push("webm"),t}function Oe(t){if(typeof MediaRecorder>"u")throw new Error("La grabación de vídeo no está disponible en este navegador");const e=[{mimeType:"video/mp4;codecs=avc1.42E01E",extension:"mp4"},{mimeType:"video/mp4",extension:"mp4"},{mimeType:"video/webm;codecs=vp9",extension:"webm"},{mimeType:"video/webm",extension:"webm"}],o=(t===void 0?e:[...e.filter(r=>r.extension===t),...e.filter(r=>r.extension!==t)]).find(r=>MediaRecorder.isTypeSupported(r.mimeType));if(o===void 0)throw new Error("Este navegador no puede grabar MP4 ni WebM");return o}const Me=10,te=.05;class Ie{constructor(e){this.gl=e;const n=e.createTexture();if(n===null)throw new Error("No se pudo crear la textura de origen");this.gpuTexture=n,e.bindTexture(e.TEXTURE_2D,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([16,16,20,255])),this.patternCanvas=document.createElement("canvas"),this.patternCanvas.width=1280,this.patternCanvas.height=720;const o=this.patternCanvas.getContext("2d");if(o===null)throw new Error("Canvas 2D no disponible para el patrón de prueba");this.patternContext=o,this.drawPattern(0)}gpuTexture;patternCanvas;patternContext;image=null;video=null;mediaStream=null;objectUrl=null;needsUpload=!0;kind="procedural";fileVideo=!1;previewLimitSeconds=0;previewLimited=!0;get texture(){return this.gpuTexture}get sourceKind(){return this.kind}get size(){return this.video!==null&&this.video.videoWidth>0?{width:this.video.videoWidth,height:this.video.videoHeight}:this.image!==null&&this.image.naturalWidth>0?{width:this.image.naturalWidth,height:this.image.naturalHeight}:{width:this.patternCanvas.width,height:this.patternCanvas.height}}get duration(){const e=this.video?.duration??0;return Number.isFinite(e)?e:0}get currentTime(){return this.video?.currentTime??0}get previewDuration(){return this.fileVideo?this.previewLimitSeconds:this.duration}isFileVideoSource(){return this.fileVideo&&this.video!==null}setPreviewLimited(e){if(this.previewLimited=e,!e){this.needsUpload=!0;return}this.fileVideo&&this.video!==null&&this.previewLimitSeconds>0&&this.video.currentTime>=this.previewLimitSeconds&&(this.video.currentTime=0,this.needsUpload=!0)}hasReachedSourceEnd(){if(!this.fileVideo||this.video===null)return!1;const e=this.duration;return e<=0?!1:this.video.ended||this.video.currentTime>=e-te}loadProcedural(){this.releaseCurrentSource(),this.kind="procedural",this.needsUpload=!0}async loadFile(e){const n=De(e);this.releaseCurrentSource();const o=URL.createObjectURL(e);this.objectUrl=o;try{if(n.kind==="video"){const a=document.createElement("video");a.muted=!0,a.loop=!1,a.playsInline=!0,a.preload="auto",this.video=a,this.kind="video",this.fileVideo=!0,await this.waitForMetadata(a,o);const s=Number.isFinite(a.duration)?a.duration:0;this.previewLimitSeconds=s>0?Math.min(Me,s):0,this.previewLimited=!0,this.needsUpload=!0,await a.play().catch(()=>{});return}const r=new Image;await new Promise((a,s)=>{r.onload=()=>a(),r.onerror=()=>s(new Error("No se pudo decodificar la imagen")),r.src=o}),await r.decode(),this.image=r,this.kind="image",this.needsUpload=!0}catch(r){throw this.video=null,this.image=null,this.kind="procedural",this.fileVideo=!1,this.previewLimitSeconds=0,this.previewLimited=!0,URL.revokeObjectURL(o),this.objectUrl=null,this.needsUpload=!0,r}}async loadCamera(){if(!navigator.mediaDevices?.getUserMedia)throw new Error("La cámara no está disponible en este navegador");this.releaseCurrentSource();const e=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:720}},audio:!1});this.mediaStream=e;const n=document.createElement("video");n.muted=!0,n.playsInline=!0,this.video=n,this.kind="camera",await new Promise((o,r)=>{n.onloadedmetadata=()=>o(),n.onerror=()=>r(new Error("No se pudo iniciar la cámara")),n.srcObject=e}),await n.play()}waitForMetadata(e,n){return new Promise((o,r)=>{e.onloadedmetadata=()=>o(),e.onerror=()=>r(new Error("No se pudo decodificar el vídeo")),e.src=n,e.load()})}play(){this.video?.play().catch(()=>{})}pause(){this.video!==null&&this.video.pause()}seek(e){if(this.video!==null&&Number.isFinite(e)){const n=this.fileVideo&&this.previewLimited&&this.previewLimitSeconds>0?this.previewLimitSeconds:this.duration;this.video.currentTime=Math.max(0,Math.min(n,e)),this.needsUpload=!0}}update(e){if(this.kind==="procedural")return this.drawPattern(e),this.upload(this.patternCanvas),!0;if(this.kind==="video"||this.kind==="camera"){const n=this.video;return n!==null&&n.readyState>=2&&(this.fileVideo&&this.previewLimited&&this.previewLimitSeconds>0&&n.currentTime>=this.previewLimitSeconds-te&&(n.currentTime=0,n.paused&&n.play().catch(()=>{}),this.needsUpload=!0),!n.paused||this.needsUpload)?(this.upload(n),this.needsUpload=!1,!0):!1}return this.needsUpload&&this.image!==null&&this.image.complete&&this.image.naturalWidth>0?(this.needsUpload=!1,this.upload(this.image),!0):!1}upload(e){const n=this.gl;n.bindTexture(n.TEXTURE_2D,this.gpuTexture),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!0),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,e),n.getError()!==n.NO_ERROR&&(this.needsUpload=!0)}drawPattern(e){const n=this.patternContext,o=this.patternCanvas.width,r=this.patternCanvas.height,a=n.createLinearGradient(0,0,o,r);a.addColorStop(0,"#14213d"),a.addColorStop(.5,"#3a2c5f"),a.addColorStop(1,"#0f0f14"),n.fillStyle=a,n.fillRect(0,0,o,r),n.strokeStyle="rgba(255, 255, 255, 0.12)",n.lineWidth=1;for(let c=0;c<=o;c+=80)n.beginPath(),n.moveTo(c,0),n.lineTo(c,r),n.stroke();for(let c=0;c<=r;c+=80)n.beginPath(),n.moveTo(0,c),n.lineTo(o,c),n.stroke();const s=90;for(let c=0;c<7;c+=1)n.fillStyle=`hsl(${c*47%360} 85% 55%)`,n.fillRect(120,90+c*(s+10),o-240-c*40,s);const l=Math.sin(e*2)*.5+.5;n.fillStyle=`rgba(255, 255, 255, ${.5+l*.5})`,n.beginPath(),n.arc(o*(.5+Math.sin(e)*.22),r*.62,70,0,Math.PI*2),n.fill(),n.font="bold 46px monospace",n.fillStyle="#ffffff",n.fillText("SASED // TEST PATTERN",120,r-60)}releaseCurrentSource(){this.video?.pause(),this.video!==null&&(this.video.srcObject=null,this.video.removeAttribute("src"),this.video.load()),this.video=null,this.image=null,this.fileVideo=!1,this.previewLimitSeconds=0,this.previewLimited=!0,this.mediaStream?.getTracks().forEach(e=>e.stop()),this.mediaStream=null,this.objectUrl!==null&&(URL.revokeObjectURL(this.objectUrl),this.objectUrl=null),this.needsUpload=!0}dispose(){this.releaseCurrentSource(),this.gl.deleteTexture(this.gpuTexture)}}class Pe{constructor(e,n,o){this.gl=e,this.width=Math.max(1,n),this.height=Math.max(1,o),this.initBuffers()}quadVAO=null;quadBuffer=null;fbos=[];textures=[];historyFBO=null;historyTexture=null;width;height;disposed=!1;get size(){return{width:this.width,height:this.height}}initBuffers(){const e=this.gl,n=new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]);this.quadVAO=e.createVertexArray(),e.bindVertexArray(this.quadVAO),this.quadBuffer=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,this.quadBuffer),e.bufferData(e.ARRAY_BUFFER,n,e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindVertexArray(null);for(let a=0;a<2;a+=1)this.createTarget(this.textures,this.fbos);const o=[],r=[];this.createTarget(o,r),this.historyTexture=o[0]??null,this.historyFBO=r[0]??null,this.allocateTextures(),this.clearHistory(),e.bindFramebuffer(e.FRAMEBUFFER,null)}createTarget(e,n){const o=this.gl,r=o.createTexture();if(r===null)throw new Error("No se pudo crear la textura del FBO");o.bindTexture(o.TEXTURE_2D,r),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE);const a=o.createFramebuffer();if(a===null)throw new Error("No se pudo crear el framebuffer");o.bindFramebuffer(o.FRAMEBUFFER,a),o.framebufferTexture2D(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,r,0),e.push(r),n.push(a)}allocateTextures(){const e=this.gl,n=[...this.textures];this.historyTexture!==null&&n.push(this.historyTexture),n.forEach(r=>{e.bindTexture(e.TEXTURE_2D,r),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,this.width,this.height,0,e.RGBA,e.UNSIGNED_BYTE,null)});const o=[...this.fbos];this.historyFBO!==null&&o.push(this.historyFBO),o.forEach(r=>{if(e.bindFramebuffer(e.FRAMEBUFFER,r),e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE)throw new Error("Framebuffer incompleto: VRAM insuficiente o formato no soportado")})}clearHistory(){if(this.disposed||this.historyFBO===null)return;const e=this.gl;e.bindFramebuffer(e.FRAMEBUFFER,this.historyFBO),e.viewport(0,0,this.width,this.height),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),e.bindFramebuffer(e.FRAMEBUFFER,null)}resize(e,n){if(this.disposed)return;const o=Math.max(1,Math.round(e)),r=Math.max(1,Math.round(n));o===this.width&&r===this.height||(this.width=o,this.height=r,this.allocateTextures(),this.clearHistory(),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null))}bindTarget(e){const n=this.gl;n.bindFramebuffer(n.FRAMEBUFFER,e===null?null:this.getFBO(e)),n.viewport(0,0,this.width,this.height)}getFBO(e){return this.fbos[(e%2+2)%2]}getTexture(e){return this.textures[(e%2+2)%2]}bindHistoryTarget(){const e=this.gl;e.bindFramebuffer(e.FRAMEBUFFER,this.historyFBO),e.viewport(0,0,this.width,this.height)}getHistoryTexture(){if(this.historyTexture===null)throw new Error("Textura de historial no disponible");return this.historyTexture}renderQuad(){if(this.disposed)return;const e=this.gl;e.bindVertexArray(this.quadVAO),e.drawArrays(e.TRIANGLES,0,6),e.bindVertexArray(null)}dispose(){if(this.disposed)return;const e=this.gl;this.textures.forEach(n=>e.deleteTexture(n)),this.fbos.forEach(n=>e.deleteFramebuffer(n)),this.historyTexture!==null&&e.deleteTexture(this.historyTexture),this.historyFBO!==null&&e.deleteFramebuffer(this.historyFBO),this.quadBuffer!==null&&e.deleteBuffer(this.quadBuffer),this.quadVAO!==null&&e.deleteVertexArray(this.quadVAO),this.disposed=!0}}class S{constructor(e,n,o,r="shader"){this.gl=e;const a=this.compile(e.VERTEX_SHADER,n,`${r}:vertex`),s=this.compile(e.FRAGMENT_SHADER,o,`${r}:fragment`),l=e.createProgram();if(l===null)throw new Error(`No se pudo crear el programa ${r}`);if(e.attachShader(l,a),e.attachShader(l,s),e.linkProgram(l),e.deleteShader(a),e.deleteShader(s),!e.getProgramParameter(l,e.LINK_STATUS)){const c=e.getProgramInfoLog(l)??"sin detalles";throw e.deleteProgram(l),new Error(`Error enlazando ${r}: ${c}`)}this.program=l}program;locations=new Map;disposed=!1;compile(e,n,o){const r=this.gl.createShader(e);if(r===null)throw new Error(`No se pudo crear el shader ${o}`);if(this.gl.shaderSource(r,n),this.gl.compileShader(r),!this.gl.getShaderParameter(r,this.gl.COMPILE_STATUS)){const a=this.gl.getShaderInfoLog(r)??"sin detalles";throw this.gl.deleteShader(r),new Error(`Error compilando ${o}: ${a}`)}return r}location(e){return this.locations.has(e)||this.locations.set(e,this.gl.getUniformLocation(this.program,e)),this.locations.get(e)??null}use(){this.disposed||this.gl.useProgram(this.program)}setFloat(e,n){const o=this.location(e);o!==null&&this.gl.uniform1f(o,n)}setInt(e,n){const o=this.location(e);o!==null&&this.gl.uniform1i(o,n)}setVec2(e,n,o){const r=this.location(e);r!==null&&this.gl.uniform2f(r,n,o)}setVec3(e,n,o,r){const a=this.location(e);a!==null&&this.gl.uniform3f(a,n,o,r)}bindTexture(e,n,o){const r=this.location(e);r!==null&&(this.gl.activeTexture(this.gl.TEXTURE0+o),this.gl.bindTexture(this.gl.TEXTURE_2D,n),this.gl.uniform1i(r,o))}dispose(){this.disposed||(this.gl.deleteProgram(this.program),this.disposed=!0)}}const Ne={PLAY:"playing",PAUSE:"paused",SCRUB_START:"scrubbing",SCRUB_END:"paused",EXPORT_START:"exporting",EXPORT_END:"paused",ERROR:"error",RESET:"idle"},Ve={idle:["PLAY","SCRUB_START","EXPORT_START","ERROR"],playing:["PAUSE","SCRUB_START","EXPORT_START","ERROR"],paused:["PLAY","SCRUB_START","EXPORT_START","ERROR"],scrubbing:["SCRUB_END","ERROR"],exporting:["EXPORT_END","ERROR"],error:["RESET"]};class je{status="idle";get current(){return this.status}can(e){return Ve[this.status].includes(e)}send(e){return this.can(e)?(this.status=Ne[e],!0):!1}reset(){this.status="idle"}}const U={blanco:"#f5f5f5",negro:"#000000",rojo:"#ff1e00",celeste:"#62f2f6"};function P(t){const e=/^#?([0-9a-fA-F]{6})$/.exec(t.trim());if(e===null)throw new Error(`Color hexadecimal inválido: ${t}`);const n=Number.parseInt(e[1],16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]}const N={shadow:U.negro,mid:U.celeste,highlight:U.blanco},Ge=["sony_ccd_v1","early_cmos","lofi_ccd"],ze=["bayer_4x4","bayer_8x8","noise"],se=[4,8,16],qe=["original","4:5","1:1","16:9","9:16"];function He(t,e,n){return Math.min(n,Math.max(e,t))}function le(t,e){return Number.isFinite(t)?t:e}function h(t,e,n,o){return He(le(t,e),n,o)}function $(t,e,n){return e.includes(t)?t:n}function ce(t,e,n){const o=le(t,n);return e.reduce((r,a)=>Math.abs(a-o)<Math.abs(r-o)?a:r)}function Xe(t){const e=b.digicam;return{isoGain:h(t.isoGain,e.isoGain,100,6400),flashThreshold:h(t.flashThreshold,e.flashThreshold,0,1),flashBloomRadius:h(t.flashBloomRadius,e.flashBloomRadius,1,16),sensorProfile:$(t.sensorProfile,Ge,e.sensorProfile),chromaAberration:h(t.chromaAberration,e.chromaAberration,0,1),lumaGrain:h(t.lumaGrain,e.lumaGrain,0,1)}}function Ye(t){const e=b.vhs;return{trackingJitter:h(t.trackingJitter,e.trackingJitter,0,1),barrelDistortion:h(t.barrelDistortion,e.barrelDistortion,-.5,.5),magneticNoise:h(t.magneticNoise,e.magneticNoise,0,1),colorBleed:h(t.colorBleed,e.colorBleed,0,1),scanlineIntensity:h(t.scanlineIntensity,e.scanlineIntensity,0,1),chromaDelay:h(t.chromaDelay,e.chromaDelay,0,1),syncDrift:h(t.syncDrift,e.syncDrift,0,1),headSwitching:h(t.headSwitching,e.headSwitching,0,1),dropouts:h(t.dropouts,e.dropouts,0,1),tapeDamage:h(t.tapeDamage,e.tapeDamage,0,1)}}function We(t){const e=b.compression;return{jpegQuality:h(t.jpegQuality,e.jpegQuality,.1,1),blockinessSize:ce(t.blockinessSize,se,e.blockinessSize),ditheringType:$(t.ditheringType,ze,e.ditheringType),posterizationLevels:Math.round(h(t.posterizationLevels,e.posterizationLevels,2,16)),blockCorruption:h(t.blockCorruption,e.blockCorruption,0,1),blockCorruptionShift:h(t.blockCorruptionShift,e.blockCorruptionShift,0,1)}}function $e(t){const e=b.brand;return{gradeAmount:h(t.gradeAmount,e.gradeAmount,0,1),dirtAmount:h(t.dirtAmount,e.dirtAmount,0,1),scratchesAmount:h(t.scratchesAmount,e.scratchesAmount,0,1),dustAmount:h(t.dustAmount,e.dustAmount,0,1),crtAmount:h(t.crtAmount,e.crtAmount,0,1),crtCurvature:h(t.crtCurvature,e.crtCurvature,0,1),crtScanlines:h(t.crtScanlines,e.crtScanlines,0,1),crtMask:h(t.crtMask,e.crtMask,0,1),crtVignette:h(t.crtVignette,e.crtVignette,0,1),crtHalation:h(t.crtHalation,e.crtHalation,0,1),crtConvergence:h(t.crtConvergence,e.crtConvergence,0,1),crtCompensation:h(t.crtCompensation,e.crtCompensation,0,1)}}function Je(t){const e=b.datamosh;return{amount:h(t.amount,e.amount,0,1),motionThreshold:h(t.motionThreshold,e.motionThreshold,0,1),blockSize:ce(t.blockSize,se,e.blockSize),feedback:h(t.feedback,e.feedback,0,1)}}function Qe(t){const e=b.imageAdjust;return{brightness:h(t.brightness,e.brightness,-1,1),contrast:h(t.contrast,e.contrast,-1,1),saturation:h(t.saturation,e.saturation,-1,1),hslSatRed:h(t.hslSatRed,e.hslSatRed,-1,1),hslSatOrange:h(t.hslSatOrange,e.hslSatOrange,-1,1),hslSatYellow:h(t.hslSatYellow,e.hslSatYellow,-1,1),hslSatGreen:h(t.hslSatGreen,e.hslSatGreen,-1,1),hslSatCyan:h(t.hslSatCyan,e.hslSatCyan,-1,1),hslSatBlue:h(t.hslSatBlue,e.hslSatBlue,-1,1),hslSatViolet:h(t.hslSatViolet,e.hslSatViolet,-1,1),hslSatMagenta:h(t.hslSatMagenta,e.hslSatMagenta,-1,1),sharpen:h(t.sharpen,e.sharpen,0,1)}}function Ke(t){const e=b.output;return{aspectRatio:$(t.aspectRatio,qe,e.aspectRatio)}}function ne(t){return{imageAdjust:Qe(t.imageAdjust),digicam:Xe(t.digicam),vhs:Ye(t.vhs),compression:We(t.compression),brand:$e(t.brand),datamosh:Je(t.datamosh),output:Ke(t.output)}}function Ze(t){return(h(t,b.digicam.isoGain,100,6400)-100)/6300}function d(t){const e=Math.min(1,Math.max(0,t));return e*e}function x(t){const e=Math.min(1,Math.abs(t));return Math.sign(t)*e*e}function z(t,e,n){const o=Math.min(n,Math.max(e,t)),r=(n-o)/(n-e);return n-d(r)*(n-e)}const et={sony_ccd_v1:0,early_cmos:1,lofi_ccd:2},tt={bayer_4x4:0,bayer_8x8:1,noise:2};function nt(t,e,n,o){t.setFloat("u_isoGain",d(Ze(e.isoGain))),t.setFloat("u_flashThreshold",z(e.flashThreshold,0,1));const r=(e.flashBloomRadius-1)/15;t.setFloat("u_flashBloomRadius",1+d(r)*15),t.setInt("u_sensorProfile",et[e.sensorProfile]),t.setFloat("u_chromaAberration",d(e.chromaAberration)),t.setFloat("u_lumaGrain",d(e.lumaGrain)),t.setFloat("u_time",n),t.setVec2("u_resolution",o.width,o.height)}function ot(t,e,n,o,r){t.setFloat("u_trackingJitter",d(e.trackingJitter)),t.setFloat("u_barrelDistortion",x(e.barrelDistortion/.5)*.5),t.setFloat("u_magneticNoise",d(e.magneticNoise)),t.setFloat("u_colorBleed",d(e.colorBleed)),t.setFloat("u_scanlineIntensity",d(e.scanlineIntensity)),t.setFloat("u_chromaDelay",d(e.chromaDelay)),t.setFloat("u_syncDrift",d(e.syncDrift)),t.setFloat("u_headSwitching",d(e.headSwitching)),t.setFloat("u_dropouts",d(e.dropouts)),t.setFloat("u_tapeDamage",d(e.tapeDamage)),t.setFloat("u_time",n),t.setFloat("u_frame",o),t.setVec2("u_resolution",r.width,r.height)}function rt(t,e,n,o){t.setFloat("u_jpegQuality",z(e.jpegQuality,.1,1)),t.setFloat("u_blockSize",e.blockinessSize),t.setInt("u_ditherType",tt[e.ditheringType]),t.setFloat("u_posterizationLevels",z(e.posterizationLevels,2,16)),t.setFloat("u_blockCorruption",d(e.blockCorruption)),t.setFloat("u_blockCorruptionShift",d(e.blockCorruptionShift)),t.setFloat("u_time",n),t.setVec2("u_resolution",o.width,o.height)}function it(t,e,n,o){const r=P(N.shadow),a=P(N.mid),s=P(N.highlight);t.setVec3("u_idoShadow",r[0],r[1],r[2]),t.setVec3("u_idoMid",a[0],a[1],a[2]),t.setVec3("u_idoHighlight",s[0],s[1],s[2]),t.setFloat("u_idoGrade",d(e.gradeAmount)),t.setFloat("u_dirtAmount",d(e.dirtAmount)),t.setFloat("u_scratchesAmount",d(e.scratchesAmount)),t.setFloat("u_dustAmount",d(e.dustAmount)),t.setFloat("u_crtAmount",d(e.crtAmount)),t.setFloat("u_crtCurvature",d(e.crtCurvature)),t.setFloat("u_crtScanlines",d(e.crtScanlines)),t.setFloat("u_crtMask",d(e.crtMask)),t.setFloat("u_crtVignette",d(e.crtVignette)),t.setFloat("u_crtHalation",d(e.crtHalation)),t.setFloat("u_crtConvergence",d(e.crtConvergence)),t.setFloat("u_crtCompensation",d(e.crtCompensation)),t.setFloat("u_time",n),t.setVec2("u_resolution",o.width,o.height)}function at(t,e,n,o){t.setFloat("u_amount",d(e.amount)),t.setFloat("u_motionThreshold",d(e.motionThreshold)),t.setFloat("u_blockSize",e.blockSize),t.setFloat("u_feedback",d(e.feedback)),t.setFloat("u_time",n),t.setVec2("u_resolution",o.width,o.height)}function st(t,e,n,o){t.setFloat("u_brightness",x(e.brightness)),t.setFloat("u_contrast",x(e.contrast)),t.setFloat("u_saturation",x(e.saturation)),t.setFloat("u_hslSatRed",x(e.hslSatRed)),t.setFloat("u_hslSatOrange",x(e.hslSatOrange)),t.setFloat("u_hslSatYellow",x(e.hslSatYellow)),t.setFloat("u_hslSatGreen",x(e.hslSatGreen)),t.setFloat("u_hslSatCyan",x(e.hslSatCyan)),t.setFloat("u_hslSatBlue",x(e.hslSatBlue)),t.setFloat("u_hslSatViolet",x(e.hslSatViolet)),t.setFloat("u_hslSatMagenta",x(e.hslSatMagenta)),t.setFloat("u_sharpen",d(e.sharpen)),t.setVec2("u_resolution",n.width,n.height),t.setVec2("u_sourceSize",Math.max(1,o.width),Math.max(1,o.height))}const lt=`// Idotiza — chunk GLSL reutilizable (GLSL ES 3.00).
// Filtro: sombra negra → medio celeste neón gastado → alto blanco.
// Insértalo después de \`precision highp float;\` y llama a idoBrandGrade().
// No declara uniforms: la paleta se pasa como parámetro para poder usarla
// en cualquier app o pipeline sin acoplamiento.

vec3 idoBrandGrade(
  vec3 color,
  vec3 shadowColor,
  vec3 midColor,
  vec3 highlightColor,
  float amount
) {
  float luma = dot(clamp(color, 0.0, 1.0), vec3(0.299, 0.587, 0.114));

  vec3 mapped = mix(shadowColor, midColor, smoothstep(0.05, 0.58, luma));
  mapped = mix(mapped, highlightColor, smoothstep(0.58, 1.0, luma));

  // Conserva detalle: modula la curva por la luminancia original.
  vec3 graded = mapped * (0.72 + 0.55 * luma);
  return clamp(mix(color, graded, clamp(amount, 0.0, 1.0)), 0.0, 1.0);
}
`,ct=`#version 300 es
layout(location = 0) in vec2 a_position;

out vec2 v_texCoord;

void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,ut=`#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture;

void main() {
  fragColor = texture(u_texture, v_texCoord);
}
`,ht=`#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform float u_brightness;    // [-1, 1]
uniform float u_contrast;      // [-1, 1]
uniform float u_saturation;    // [-1, 1] ajuste global (0 neutro)
uniform float u_hslSatRed;     // [-1, 1]
uniform float u_hslSatOrange;  // [-1, 1]
uniform float u_hslSatYellow;  // [-1, 1]
uniform float u_hslSatGreen;   // [-1, 1]
uniform float u_hslSatCyan;    // [-1, 1]
uniform float u_hslSatBlue;    // [-1, 1]
uniform float u_hslSatViolet;  // [-1, 1]
uniform float u_hslSatMagenta; // [-1, 1]
uniform float u_sharpen;       // [0, 1]
uniform vec2 u_resolution;     // tamaño de salida (frame)
uniform vec2 u_sourceSize;     // tamaño de la fuente original

float luma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

vec3 rgb2hsl(vec3 c) {
  float maxc = max(c.r, max(c.g, c.b));
  float minc = min(c.r, min(c.g, c.b));
  float d = maxc - minc;
  float h = 0.0;
  if (d > 1e-5) {
    if (maxc == c.r) {
      h = mod((c.g - c.b) / d, 6.0);
    } else if (maxc == c.g) {
      h = (c.b - c.r) / d + 2.0;
    } else {
      h = (c.r - c.g) / d + 4.0;
    }
    h /= 6.0;
    if (h < 0.0) h += 1.0;
  }
  float l = (maxc + minc) * 0.5;
  float s = 0.0;
  if (d > 1e-5) {
    s = d / (1.0 - abs(2.0 * l - 1.0));
  }
  return vec3(h, clamp(s, 0.0, 1.0), l);
}

float hue2rgb(float p, float q, float t) {
  if (t < 0.0) t += 1.0;
  if (t > 1.0) t -= 1.0;
  if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
  if (t < 1.0 / 2.0) return q;
  if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
  return p;
}

vec3 hsl2rgb(vec3 hsl) {
  float h = hsl.x;
  float s = clamp(hsl.y, 0.0, 1.0);
  float l = clamp(hsl.z, 0.0, 1.0);
  if (s <= 1e-5) {
    return vec3(l);
  }
  float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
  float p = 2.0 * l - q;
  float r = hue2rgb(p, q, h + 1.0 / 3.0);
  float g = hue2rgb(p, q, h);
  float b = hue2rgb(p, q, h - 1.0 / 3.0);
  return vec3(r, g, b);
}

float hueDist(float a, float b) {
  float d = abs(a - b);
  return min(d, 1.0 - d);
}

float hueWeight(float h, float center, float width) {
  return 1.0 - smoothstep(width * 0.5, width, hueDist(h, center));
}

vec4 sampleSource(vec2 srcUv) {
  if (srcUv.x < 0.0 || srcUv.x > 1.0 || srcUv.y < 0.0 || srcUv.y > 1.0) {
    return vec4(0.0, 0.0, 0.0, 1.0);
  }
  return texture(u_texture, srcUv);
}

void main() {
  vec2 uv = clamp(v_texCoord, 0.0, 1.0);

  // Ajuste de encuadre (contain): sin stretch/warp, con letterbox si el aspecto difiere.
  vec2 outRes = max(u_resolution, vec2(1.0));
  vec2 srcRes = max(u_sourceSize, vec2(1.0));
  float outAspect = outRes.x / outRes.y;
  float srcAspect = srcRes.x / srcRes.y;
  vec2 fitScale = vec2(min(1.0, srcAspect / outAspect), min(1.0, outAspect / srcAspect));
  vec2 fitOffset = (1.0 - fitScale) * 0.5;
  vec2 srcUv = (uv - fitOffset) / max(fitScale, vec2(1e-6));

  if (srcUv.x < 0.0 || srcUv.x > 1.0 || srcUv.y < 0.0 || srcUv.y > 1.0) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec4 src = texture(u_texture, srcUv);
  vec3 color = clamp(src.rgb, 0.0, 1.0);

  bool neutral =
    abs(u_brightness) <= 0.0001 &&
    abs(u_contrast) <= 0.0001 &&
    abs(u_saturation) <= 0.0001 &&
    abs(u_hslSatRed) <= 0.0001 &&
    abs(u_hslSatOrange) <= 0.0001 &&
    abs(u_hslSatYellow) <= 0.0001 &&
    abs(u_hslSatGreen) <= 0.0001 &&
    abs(u_hslSatCyan) <= 0.0001 &&
    abs(u_hslSatBlue) <= 0.0001 &&
    abs(u_hslSatViolet) <= 0.0001 &&
    abs(u_hslSatMagenta) <= 0.0001 &&
    u_sharpen <= 0.0001;
  if (neutral) {
    fragColor = vec4(color, src.a);
    return;
  }

  // Brillo y contraste.
  float contrastFactor = 1.0 + u_contrast;
  color = (color - 0.5) * contrastFactor + 0.5;
  color += u_brightness;

  // Saturación global.
  if (abs(u_saturation) > 0.0001) {
    float y = luma(color);
    float satFactor = 1.0 + u_saturation;
    color = mix(vec3(y), color, satFactor);
  }

  // HSL por colores (solo saturación): rojo, naranja, amarillo, verde, cian, azul, violeta, magenta.
  vec3 hsl = rgb2hsl(clamp(color, 0.0, 1.0));
  float w = 0.14;
  float satAdjust = 0.0;
  satAdjust += hueWeight(hsl.x, 0.0 / 360.0, w) * u_hslSatRed;
  satAdjust += hueWeight(hsl.x, 30.0 / 360.0, w) * u_hslSatOrange;
  satAdjust += hueWeight(hsl.x, 60.0 / 360.0, w) * u_hslSatYellow;
  satAdjust += hueWeight(hsl.x, 120.0 / 360.0, w) * u_hslSatGreen;
  satAdjust += hueWeight(hsl.x, 180.0 / 360.0, w) * u_hslSatCyan;
  satAdjust += hueWeight(hsl.x, 240.0 / 360.0, w) * u_hslSatBlue;
  satAdjust += hueWeight(hsl.x, 270.0 / 360.0, w) * u_hslSatViolet;
  satAdjust += hueWeight(hsl.x, 300.0 / 360.0, w) * u_hslSatMagenta;
  if (abs(satAdjust) > 0.0001) {
    hsl.y = clamp(hsl.y * (1.0 + satAdjust), 0.0, 1.0);
    color = hsl2rgb(hsl);
  }

  // Afilar imagen (unsharp mask agresivo) en espacio de fuente.
  if (u_sharpen > 0.0001) {
    vec2 texel = 1.0 / srcRes;
    vec3 baseBlur =
      sampleSource(srcUv + vec2(texel.x, 0.0)).rgb +
      sampleSource(srcUv - vec2(texel.x, 0.0)).rgb +
      sampleSource(srcUv + vec2(0.0, texel.y)).rgb +
      sampleSource(srcUv - vec2(0.0, texel.y)).rgb +
      sampleSource(srcUv + vec2(texel.x, texel.y)).rgb +
      sampleSource(srcUv + vec2(-texel.x, texel.y)).rgb +
      sampleSource(srcUv + vec2(texel.x, -texel.y)).rgb +
      sampleSource(srcUv + vec2(-texel.x, -texel.y)).rgb;
    baseBlur *= 1.0 / 8.0;
    vec3 detail = src.rgb - baseBlur;
    color += detail * u_sharpen * 3.5;
  }

  fragColor = vec4(clamp(color, 0.0, 1.0), src.a);
}`,dt=`#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform float u_isoGain;          // ISO normalizado [0-1]
uniform float u_flashThreshold;   // [0-1]
uniform float u_flashBloomRadius; // [1-16] píxeles
uniform int u_sensorProfile;      // 0 Sony CCD, 1 CMOS, 2 lofi CCD
uniform float u_chromaAberration; // [0-1]
uniform float u_lumaGrain;        // [0-1]
uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Rolloff CCD: x*(1+k)/(x+k) satura suavemente y conserva el blanco.
vec3 sensorRolloff(vec3 x, float knee) {
  x = max(x, vec3(0.0));
  return (x * (1.0 + knee)) / (x + knee);
}

void main() {
  vec4 texel = texture(u_texture, v_texCoord);
  vec3 base = clamp(texel.rgb, 0.0, 1.0);

  // Estado neutro: preservar imagen natural sin perfil/tono de sensor.
  bool neutral =
    u_isoGain <= 0.0001 &&
    u_flashThreshold >= 0.999 &&
    u_chromaAberration <= 0.0001 &&
    u_lumaGrain <= 0.0001;
  if (neutral) {
    fragColor = vec4(base, texel.a);
    return;
  }

  vec2 center = vec2(0.5);
  vec2 caDir = v_texCoord - center;
  float caAmount = u_chromaAberration * 0.018;
  vec2 uvR = clamp(v_texCoord + caDir * caAmount, 0.0, 1.0);
  vec2 uvB = clamp(v_texCoord - caDir * caAmount, 0.0, 1.0);

  vec3 sampleR = max(texture(u_texture, uvR).rgb, vec3(0.0));
  vec3 sampleB = max(texture(u_texture, uvB).rgb, vec3(0.0));
  vec3 color = base;
  color = vec3(sampleR.r, texel.g, sampleB.b);

  // Ganancia ISO + ruido de sensor aproximando Poisson con ruido dependiente de señal.
  float gain = 1.0 + u_isoGain * 3.0;
  color *= gain;
  float shot = (hash(gl_FragCoord.xy + floor(u_time * 24.0)) - 0.5);
  color += shot * u_isoGain * (0.06 + 0.12 * sqrt(max(color.r, 0.0)));

  if (u_sensorProfile == 0) {
    color = sensorRolloff(pow(color, vec3(1.12)), 0.28);
    color *= vec3(1.0, 0.97, 0.94);
  } else if (u_sensorProfile == 1) {
    color = sensorRolloff(pow(color, vec3(0.95)), 0.48);
    color *= vec3(0.96, 1.0, 0.99);
  } else {
    color = sensorRolloff(pow(color, vec3(0.88)), 0.20);
    color *= vec3(1.08, 0.92, 1.04);
  }

  // Flash digital: overflow aditivo hacia vecinos mediante 8 taps radiales.
  float overflow = 0.0;
  vec2 px = 1.0 / u_resolution;
  for (int i = 0; i < 8; i++) {
    float angle = float(i) * 0.78539816;
    vec2 offset = vec2(cos(angle), sin(angle)) * u_flashBloomRadius * px;
    vec3 neighbour = max(texture(u_texture, v_texCoord + offset).rgb, vec3(0.0));
    float lum = dot(neighbour, vec3(0.299, 0.587, 0.114)) * gain;
    overflow += max(lum - u_flashThreshold, 0.0);
  }
  color += (overflow / 8.0) * 0.4;

  float luminance = dot(color, vec3(0.299, 0.587, 0.114));
  if (luminance > u_flashThreshold) {
    float clip = clamp((luminance - u_flashThreshold) / max(1.0 - u_flashThreshold, 0.001), 0.0, 1.0);
    color = mix(color, vec3(1.0), clip);
  }

  // Grano dependiente de luminancia: más presente en sombras y medios tonos.
  float grainLuma = dot(color, vec3(0.299, 0.587, 0.114));
  float grainWeight = clamp((1.0 - grainLuma) * 0.8 + 4.0 * grainLuma * (1.0 - grainLuma) * 0.6, 0.0, 1.25);
  float fineGrain = hash(gl_FragCoord.xy * 0.73 + floor(u_time * 60.0)) - 0.5;
  color += fineGrain * u_lumaGrain * 0.18 * grainWeight;

  fragColor = vec4(clamp(color, 0.0, 1.0), texel.a);
}
`,mt=`#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform float u_time;
uniform float u_frame;
uniform float u_trackingJitter;      // [0-1]
uniform float u_barrelDistortion;    // [-0.5, 0.5]
uniform float u_magneticNoise;       // [0-1]
uniform float u_colorBleed;          // [0-1]
uniform float u_scanlineIntensity;   // [0-1]
uniform float u_chromaDelay;         // [0-1]
uniform float u_syncDrift;           // [0-1]
uniform float u_headSwitching;       // [0-1]
uniform float u_dropouts;            // [0-1]
uniform float u_tapeDamage;          // [0-1]
uniform vec2 u_resolution;
uniform vec2 u_opticalCenter;

float hash(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float perlin1d(float x) {
  float i = floor(x);
  float f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), f);
}

vec3 rgb2yiq(vec3 c) {
  return vec3(
    dot(c, vec3(0.299, 0.587, 0.114)),
    dot(c, vec3(0.596, -0.274, -0.322)),
    dot(c, vec3(0.211, -0.523, 0.312))
  );
}

vec3 yiq2rgb(vec3 c) {
  return vec3(
    c.x + 0.956 * c.y + 0.621 * c.z,
    c.x - 0.272 * c.y - 0.647 * c.z,
    c.x - 1.106 * c.y + 1.703 * c.z
  );
}

// Distorsión de barril/tubo CRT centrada en el optical center.
vec2 barrel(vec2 uv, float k) {
  vec2 centred = uv * 2.0 - 1.0;
  float r2 = dot(centred, centred);
  centred *= 1.0 + k * r2;
  return clamp(centred * 0.5 + 0.5, 0.0, 1.0);
}

vec2 sampleUv(vec2 uv) {
  return clamp(uv, 0.0, 1.0);
}

void main() {
  vec4 src = texture(u_texture, v_texCoord);
  float vhsFx = clamp(
    u_trackingJitter +
    abs(u_barrelDistortion) * 2.0 +
    u_magneticNoise +
    u_colorBleed +
    u_scanlineIntensity +
    u_chromaDelay +
    u_syncDrift +
    u_headSwitching +
    u_dropouts +
    u_tapeDamage,
    0.0,
    1.0
  );

  // Estado neutro: preservar imagen natural sin procesado VHS.
  if (vhsFx <= 0.0001) {
    fragColor = vec4(clamp(src.rgb, 0.0, 1.0), src.a);
    return;
  }

  vec2 uv = barrel(v_texCoord, u_barrelDistortion);
  float line = floor(uv.y * u_resolution.y);
  vec2 px = 1.0 / max(u_resolution, vec2(1.0));

  // 6) Inestabilidad temporal más coherente: bandas persistentes + skew mecánico.
  float driftBand = floor(uv.y * 20.0);
  float driftStep = floor(u_time * 1.8);
  float slowBand = mix(hash(driftBand + driftStep * 7.3), hash(driftBand + (driftStep + 1.0) * 7.3), fract(u_time * 1.8));
  float drift = (slowBand - 0.5) * 0.018;
  float jumpGate = step(0.965, hash(driftBand * 0.37 + floor(u_time * 1.1) * 3.7));
  float driftJump = jumpGate * (hash(driftBand + floor(u_time * 1.1) * 9.1) - 0.5) * 0.05;
  float bandPhase = fract(uv.y * 20.0) - 0.5;
  float driftSkew = bandPhase * (hash(driftBand + driftStep * 2.0) - 0.5) * 0.02;
  float driftOffset = (drift + driftJump + driftSkew) * u_syncDrift;

  // Jitter de tracking con componente por grupos de líneas (persistencia corta).
  float lineGroup = floor(line / 3.0);
  float smoothJitter = (perlin1d(line * 0.065 + u_time * 1.2) - 0.5) * u_trackingJitter * 0.02;
  float groupJitter = (hash(lineGroup + floor(u_time * 7.0) * 5.3) - 0.5) * u_trackingJitter * 0.01;
  float whiteJitter = (hash(line + u_time * 55.0) - 0.5) * u_trackingJitter * 0.004;

  // 4) Head switching más característico: banda inferior con borde irregular y ondulación.
  float hsBase = 0.86 - u_headSwitching * 0.05;
  float hsWobble = (perlin1d(uv.x * 18.0 + u_time * 5.0) - 0.5) * 0.012;
  float hsLineWobble = (hash(line + floor(u_time * 30.0)) - 0.5) * 0.003;
  float hsMask = smoothstep(hsBase + hsWobble, 0.997, uv.y + hsLineWobble);
  float hsEvent = step(0.955, hash(floor(u_time * 6.0)));
  float hsOffset = (hash(line + u_time * 42.0) - 0.5) * hsMask * (0.01 + hsEvent * 0.045) * u_headSwitching;
  float hsBend = (uv.y - hsBase) * (hash(floor(u_time * 3.0)) - 0.5) * hsMask * 0.03 * u_headSwitching;

  uv.x = clamp(uv.x + smoothJitter + groupJitter + whiteJitter + driftOffset + hsOffset + hsBend, 0.0, 1.0);

  // Pliegues / daño de cinta: distorsiones locales tipo arruga.
  vec3 tapeOverlay = vec3(0.0);
  float tapeMix = 0.0;
  if (u_tapeDamage > 0.001) {
    for (int i = 0; i < 2; i++) {
      float slot = floor(u_time * 0.7) + float(i) * 17.0;
      float enabled = step(1.0 - u_tapeDamage * 0.55, hash(slot + 3.1));
      float cy = hash(slot + 11.0);
      float cx = hash(slot + 19.0);
      float h = mix(0.04, 0.16, hash(slot + 23.0));
      float w = mix(0.08, 0.45, hash(slot + 29.0));
      float dy = abs(uv.y - cy);
      if (enabled > 0.5 && dy < h && abs(uv.x - cx) < w) {
        float edge = 1.0 - dy / h;
        float warp = (hash(slot + floor(uv.y * 120.0)) - 0.5) * 0.06 * edge * u_tapeDamage;
        uv.x = clamp(uv.x + warp, 0.0, 1.0);
        uv.y = clamp(uv.y + (hash(slot + 41.0) - 0.5) * 0.02 * edge * u_tapeDamage, 0.0, 1.0);
        vec2 ghostUv = sampleUv(uv + vec2(0.012 * edge * u_tapeDamage, 0.0));
        tapeOverlay += texture(u_texture, ghostUv).rgb * edge;
        tapeMix = max(tapeMix, edge * 0.35 * u_tapeDamage);
      }
    }
  }

  // 1) Ancho de banda limitado de croma + 5) luma más suave (look VHS).
  float lumaDelay = u_chromaDelay * 0.045;
  vec2 radial = uv - u_opticalCenter;
  vec2 chromaBaseUv = sampleUv(uv - vec2(lumaDelay, 0.0) + radial * (0.002 + u_colorBleed * 0.01));

  // Chroma blur horizontal (I/Q) con varios taps.
  float chromaBlurPx = mix(0.0, 6.0, clamp(u_colorBleed * 0.7 + u_chromaDelay * 0.5, 0.0, 1.0));
  vec2 chromaOff = vec2(px.x * chromaBlurPx, 0.0);
  vec3 yiqC = vec3(0.0);
  yiqC += rgb2yiq(texture(u_texture, sampleUv(chromaBaseUv - chromaOff * 1.6)).rgb) * 0.08;
  yiqC += rgb2yiq(texture(u_texture, sampleUv(chromaBaseUv - chromaOff)).rgb) * 0.17;
  yiqC += rgb2yiq(texture(u_texture, sampleUv(chromaBaseUv)).rgb) * 0.50;
  yiqC += rgb2yiq(texture(u_texture, sampleUv(chromaBaseUv + chromaOff)).rgb) * 0.17;
  yiqC += rgb2yiq(texture(u_texture, sampleUv(chromaBaseUv + chromaOff * 1.6)).rgb) * 0.08;

  // Luma con suavizado horizontal sutil (proporcional a intensidad VHS).
  float lumaTapL = rgb2yiq(texture(u_texture, sampleUv(uv - vec2(px.x * 1.2, 0.0))).rgb).x;
  float lumaTapC = rgb2yiq(texture(u_texture, uv).rgb).x;
  float lumaTapR = rgb2yiq(texture(u_texture, sampleUv(uv + vec2(px.x * 1.2, 0.0))).rgb).x;
  float lumaSoft = lumaTapC * 0.7 + (lumaTapL + lumaTapR) * 0.15;
  float luma = mix(lumaTapC, lumaSoft, 0.22 * vhsFx);

  // Inestabilidad de fase/croma leve.
  float chromaPhase = (hash(floor(u_time * 15.0) + line * 0.13) - 0.5) * 0.03 * (u_colorBleed + u_magneticNoise * 0.5);
  vec3 yiq = vec3(luma, yiqC.y + chromaPhase * 0.5, yiqC.z - chromaPhase);
  vec3 color = yiq2rgb(yiq);

  // Mezcla de daño de cinta (pliegues/doble imagen local).
  if (tapeMix > 0.0) {
    color = mix(color, tapeOverlay, clamp(tapeMix, 0.0, 0.7));
    color *= 1.0 - tapeMix * 0.22;
  }

  // 4) Head switching: ruido estructurado y cambio de nivel en la banda inferior.
  if (hsMask > 0.001) {
    float hsNoise = hash2(vec2(line, floor(u_time * 60.0))) - 0.5;
    float hsStripe = sin((uv.y * u_resolution.y + u_time * 25.0) * 6.2831) * 0.5 + 0.5;
    color += vec3(hsNoise * 0.14 + (hsStripe - 0.5) * 0.06) * hsMask * u_headSwitching;
    color *= 1.0 - hsMask * u_headSwitching * 0.08;
  }

  // 2) Ruido magnético separado luma/croma (más en sombras y en croma).
  float yNow = dot(clamp(color, 0.0, 1.0), vec3(0.299, 0.587, 0.114));
  float shadowBoost = 0.55 + (1.0 - yNow) * 0.85;
  vec3 nyiq = rgb2yiq(color);
  float nTime = floor(u_time * 60.0);
  float nY = hash2(floor(uv * u_resolution) + vec2(nTime, u_frame)) - 0.5;
  float nI = hash2(floor(uv * u_resolution * 0.75) + vec2(nTime + 17.0, u_frame)) - 0.5;
  float nQ = hash2(floor(uv * u_resolution * 0.75) + vec2(nTime + 43.0, u_frame + 3.0)) - 0.5;
  nyiq.x += nY * u_magneticNoise * 0.12;
  nyiq.y += nI * u_magneticNoise * 0.22 * shadowBoost;
  nyiq.z += nQ * u_magneticNoise * 0.22 * shadowBoost;

  // Bandas de RF: leve contaminación de luma/croma.
  float rfBand = step(0.985, hash(floor(uv.y * 46.0) + floor(u_time * 9.0)));
  nyiq.x += rfBand * u_magneticNoise * 0.08;
  nyiq.yz += (hash2(vec2(floor(uv.y * 46.0), floor(u_time * 9.0))) - 0.5) * rfBand * u_magneticNoise * 0.12;
  color = yiq2rgb(nyiq);

  // 3) Dropouts tipo raya horizontal con cola (forma VHS).
  if (u_dropouts > 0.001) {
    float dLine = floor(uv.y * u_resolution.y);
    float dTime = floor(u_time * 24.0);
    float dSeed = hash2(vec2(dLine, dTime));
    float dTrig = step(1.0 - u_dropouts * 0.16, dSeed);
    if (dTrig > 0.5) {
      float startX = hash2(vec2(dLine + 3.0, dTime * 1.3)) * 0.85;
      float len = mix(0.03, 0.45, hash2(vec2(dLine, dTime + 11.0))) * (0.4 + u_dropouts);
      if (uv.x >= startX && uv.x <= startX + len) {
        float t = (uv.x - startX) / max(len, 0.0001);
        float fade = 1.0 - smoothstep(0.0, 1.0, t);
        float edgeNoise = 0.85 + 0.3 * hash2(vec2(floor(uv.x * 160.0), dLine + dTime));
        float dropout = fade * edgeNoise;
        float polarity = step(0.5, hash2(vec2(dLine + 7.0, dTime)));
        vec3 dropColor = mix(vec3(0.03), vec3(0.97), polarity);
        dropColor += (hash2(vec2(uv.x * u_resolution.x * 0.3, dTime)) - 0.5) * 0.08;
        color = mix(color, dropColor, clamp(dropout * (0.45 + u_dropouts * 0.45), 0.0, 1.0));
      }
    }
  }

  // Entrelazado temporal: la paridad depende del fotograma F.
  float parity = mod(floor(uv.y * u_resolution.y) + u_frame, 2.0);
  float scanlines = 1.0 - parity * u_scanlineIntensity * 0.22;
  scanlines -= (sin(uv.y * u_resolution.y * 1.5) * 0.5 + 0.5) * u_scanlineIntensity * 0.05;
  color *= scanlines;

  // 7) Respuesta de cinta: rolloff suave, negros levantados y leve desaturación en daño.
  color = clamp(color, 0.0, 1.0);
  float lumaTone = dot(color, vec3(0.299, 0.587, 0.114));
  vec3 gradedColor = color / (color + vec3(0.22)) * 1.22; // soft knee / rolloff
  gradedColor = mix(vec3(0.012), gradedColor, 0.992); // leve black lift
  float wear = clamp(u_magneticNoise * 0.5 + u_tapeDamage * 0.5 + u_dropouts * 0.25, 0.0, 1.0);
  float sat = mix(1.0, 0.86, wear * (0.35 + (1.0 - lumaTone) * 0.25));
  float grey = dot(gradedColor, vec3(0.299, 0.587, 0.114));
  gradedColor = mix(vec3(grey), gradedColor, sat);
  color = mix(color, gradedColor, clamp(vhsFx, 0.0, 1.0));

  fragColor = vec4(clamp(color, 0.0, 1.0), src.a);
}
`,ft=`#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform float u_jpegQuality;          // [0.1-1]
uniform float u_blockSize;            // 4, 8 o 16
uniform int u_ditherType;             // 0 bayer4, 1 bayer8, 2 ruido
uniform float u_posterizationLevels;  // [2-16]
uniform float u_blockCorruption;      // [0-1]
uniform float u_blockCorruptionShift; // [0-1]
uniform float u_time;
uniform vec2 u_resolution;

const int BAYER4[16] = int[16](
   0,  8,  2, 10,
  12,  4, 14,  6,
   3, 11,  1,  9,
  15,  7, 13,  5
);

float bayer4Value(int x, int y) {
  return (float(BAYER4[(y & 3) * 4 + (x & 3)]) + 0.5) / 16.0;
}

float bayer8Value(int x, int y) {
  float low = float(BAYER4[(y & 3) * 4 + (x & 3)]);
  float high = float(BAYER4[((y >> 2) & 3) * 4 + ((x >> 2) & 3)]);
  return (low * 4.0 + high + 0.5) / 64.0;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  // Estado neutro: preservar imagen natural sin cuantización/dithering.
  if (u_blockCorruption <= 0.001 && u_jpegQuality >= 0.999 && u_posterizationLevels >= 15.999) {
    fragColor = vec4(clamp(texture(u_texture, v_texCoord).rgb, 0.0, 1.0), 1.0);
    return;
  }

  vec2 sampleUv = v_texCoord;

  // Corrupción por bloques: desplaza o repite tiles completos de forma temporal.
  if (u_blockCorruption > 0.001) {
    float bsz = max(u_blockSize, 4.0);
    vec2 blockId = floor(v_texCoord * u_resolution / bsz);
    float tSlot = floor(u_time * 10.0);
    float rnd = hash(blockId + vec2(tSlot, 3.7));
    if (rnd < u_blockCorruption * 0.7) {
      vec2 shift = vec2(
        hash(blockId + vec2(tSlot, 11.1)) - 0.5,
        hash(blockId + vec2(tSlot, 23.3)) - 0.5
      );
      shift *= u_blockCorruptionShift * 0.3;
      // A veces repite un bloque cercano en vez de desplazar suavemente.
      if (hash(blockId + vec2(tSlot, 41.9)) > 0.6) {
        shift = floor(shift * 6.0) / 6.0;
      }
      sampleUv = clamp(v_texCoord + shift, 0.0, 1.0);
    }
  }

  vec2 pixel = sampleUv * u_resolution;
  ivec2 cell = ivec2(floor(v_texCoord * u_resolution));
  vec3 color = max(texture(u_texture, clamp(sampleUv, 0.0, 1.0)).rgb, vec3(0.0));

  // Macrobloques MPEG: muestreo forzado al centro de cada bloque.
  vec2 snappedUv = (floor(pixel / u_blockSize) + 0.5) * u_blockSize / u_resolution;
  vec3 blockColor = max(texture(u_texture, clamp(snappedUv, 0.0, 1.0)).rgb, vec3(0.0));
  float blockMix = (1.0 - u_jpegQuality) * 0.85;
  color = mix(color, blockColor, blockMix);

  // Cuantización tipo JPEG (aproximación por niveles).
  float qLevels = 2.0 + u_jpegQuality * 62.0;
  color = floor(color * qLevels + 0.5) / qLevels;

  // Dithering + posterización combinados.
  float threshold;
  if (u_ditherType == 0) {
    threshold = bayer4Value(cell.x, cell.y);
  } else if (u_ditherType == 1) {
    threshold = bayer8Value(cell.x, cell.y);
  } else {
    threshold = hash(pixel);
  }
  float steps = max(u_posterizationLevels - 1.0, 1.0);
  color = floor(color * steps + threshold) / steps;

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`,pt=`#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform vec3 u_idoShadow;
uniform vec3 u_idoMid;
uniform vec3 u_idoHighlight;
uniform float u_idoGrade;
uniform float u_dirtAmount;
uniform float u_scratchesAmount;
uniform float u_dustAmount;
uniform float u_crtAmount;
uniform float u_crtCurvature;
uniform float u_crtScanlines;
uniform float u_crtMask;
uniform float u_crtVignette;
uniform float u_crtHalation;
uniform float u_crtConvergence;
uniform float u_crtCompensation;
uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec2 crtCurve(vec2 uv, float k) {
  vec2 cc = uv * 2.0 - 1.0;
  float r2 = dot(cc, cc);
  cc *= 1.0 + k * r2 + k * 0.35 * r2 * r2;
  return cc * 0.5 + 0.5;
}

void main() {
  vec2 uv = v_texCoord;
  float crt = clamp(u_crtAmount, 0.0, 1.0);
  float curvature = clamp(u_crtCurvature, 0.0, 1.0);
  float scanlines = clamp(u_crtScanlines, 0.0, 1.0);
  float maskStrength = clamp(u_crtMask, 0.0, 1.0);
  float vignetteAmt = clamp(u_crtVignette, 0.0, 1.0);
  float halation = clamp(u_crtHalation, 0.0, 1.0);
  float convergence = clamp(u_crtConvergence, 0.0, 1.0);
  float compensation = clamp(u_crtCompensation, 0.0, 1.0);

  // Compensación de curvatura: zoom uniforme centrado (preserva proporción) para recortar bordes.
  float zoom = 1.0 + compensation * 0.6;
  vec2 zUv = (uv - 0.5) / zoom + 0.5;
  vec2 sampleUv = zUv;

  float curveAmt = crt * curvature;
  if (curveAmt > 0.001) {
    sampleUv = crtCurve(zUv, curveAmt * 0.18);
  }

  vec2 px = 1.0 / max(u_resolution, vec2(1.0));
  bool outside = sampleUv.x < 0.0 || sampleUv.x > 1.0 || sampleUv.y < 0.0 || sampleUv.y > 1.0;
  vec3 color = vec3(0.02);
  if (!outside) {
    vec2 baseUv = clamp(sampleUv, 0.0, 1.0);
    float convAmt = crt * convergence;
    if (convAmt > 0.001) {
      vec2 dir = (baseUv - 0.5);
      vec2 offset = dir * vec2(px.x * 10.0, px.y * 6.0) * convAmt;
      color.r = texture(u_texture, clamp(baseUv + offset, 0.0, 1.0)).r;
      color.g = texture(u_texture, baseUv).g;
      color.b = texture(u_texture, clamp(baseUv - offset, 0.0, 1.0)).b;
    } else {
      color = texture(u_texture, baseUv).rgb;
    }
  }

  // Halación/bloom leve estilo CRT.
  float halationAmt = crt * halation;
  if (halationAmt > 0.001 && !outside) {
    vec2 baseUv = clamp(sampleUv, 0.0, 1.0);
    vec3 glow = vec3(0.0);
    glow += texture(u_texture, clamp(baseUv + vec2(px.x, 0.0) * 2.0, 0.0, 1.0)).rgb;
    glow += texture(u_texture, clamp(baseUv - vec2(px.x, 0.0) * 2.0, 0.0, 1.0)).rgb;
    glow += texture(u_texture, clamp(baseUv + vec2(0.0, px.y) * 2.0, 0.0, 1.0)).rgb;
    glow += texture(u_texture, clamp(baseUv - vec2(0.0, px.y) * 2.0, 0.0, 1.0)).rgb;
    glow *= 0.25;
    color += max(glow - 0.55, vec3(0.0)) * halationAmt * 0.35;
  }

  color = idoBrandGrade(color, u_idoShadow, u_idoMid, u_idoHighlight, u_idoGrade);

  // Suciedad: manchas y velos suaves.
  if (u_dirtAmount > 0.001) {
    float n1 = noise(sampleUv * 3.5 + vec2(1.7, 4.2));
    float n2 = noise(sampleUv * 11.0 - vec2(3.1, 0.7));
    float blotch = smoothstep(0.55, 0.92, n1) * (0.5 + 0.5 * n2);
    float smudge = smoothstep(0.65, 1.0, noise(sampleUv * vec2(18.0, 4.0) + vec2(0.0, 2.3)));
    float dirt = clamp(blotch * 0.7 + smudge * 0.3, 0.0, 1.0);
    color *= 1.0 - dirt * u_dirtAmount * 0.45;
    color += vec3(0.08, 0.07, 0.06) * dirt * u_dirtAmount * 0.08;
  }

  // Rayones: líneas finas verticales con movimiento temporal.
  if (u_scratchesAmount > 0.001) {
    float scratch = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float t = floor(u_time * (6.0 + fi * 2.0));
      float x = hash(vec2(t, fi * 13.1));
      float w = mix(0.0008, 0.0022, hash(vec2(t, fi * 7.7)));
      float line = smoothstep(w, 0.0, abs(sampleUv.x - x));
      float seg = step(0.35, hash(vec2(floor(sampleUv.y * 12.0), t + fi)));
      scratch = max(scratch, line * seg * (0.4 + 0.6 * hash(vec2(t, fi + 2.0))));
    }
    float darkScratch = scratch * step(0.5, hash(vec2(floor(u_time * 5.0), 9.2)));
    color += vec3(1.0) * scratch * u_scratchesAmount * 0.18;
    color -= vec3(0.25) * darkScratch * u_scratchesAmount * 0.12;
  }

  // Polvo: motas pequeñas intermitentes.
  if (u_dustAmount > 0.001) {
    vec2 grid = floor(sampleUv * u_resolution * 0.35);
    float t = floor(u_time * 18.0);
    float d = hash(grid + vec2(t, 5.3));
    float speck = step(1.0 - u_dustAmount * 0.02, d);
    float tone = step(0.5, hash(grid + vec2(t, 17.9)));
    float dustColor = mix(-0.35, 0.45, tone);
    color += vec3(dustColor) * speck * u_dustAmount;
  }

  // CRT: scanlines, máscara de fósforo, viñeta y bordes (controles independientes).
  float scanAmt = crt * scanlines;
  float maskAmt = crt * maskStrength;
  if (scanAmt > 0.001 || maskAmt > 0.001) {
    float scan = 0.92 + 0.08 * sin((sampleUv.y * u_resolution.y + u_time * 12.0) * 3.14159);
    float mask = 0.94 + 0.06 * sin(sampleUv.x * u_resolution.x * 1.2);
    float scanFactor = mix(1.0, scan, scanAmt);
    float maskFactor = mix(1.0, mask, maskAmt);
    color *= scanFactor * maskFactor;
  }
  float vignAmt = crt * vignetteAmt;
  if (vignAmt > 0.001) {
    vec2 d = abs(uv - 0.5) * 2.0;
    float vign = 1.0 - smoothstep(0.72, 1.25, dot(d, d));
    color *= mix(1.0, vign, vignAmt * 0.45);
  }
  if (outside) {
    color = vec3(0.01);
  }

  // Grano sutil para unificar imagen y UI bajo la misma textura de marca.
  float grain = hash(gl_FragCoord.xy + vec2(floor(u_time * 60.0), 0.0)) - 0.5;
  color += grain * u_idoGrade * 0.025;

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`,vt=`#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform sampler2D u_history;
uniform float u_amount;          // [0-1]
uniform float u_motionThreshold; // [0-1]
uniform float u_blockSize;       // 4, 8, 16
uniform float u_feedback;        // [0-1]
uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float luma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

void main() {
  vec2 uv = clamp(v_texCoord, 0.0, 1.0);
  vec3 cur = texture(u_texture, uv).rgb;

  if (u_amount <= 0.001) {
    fragColor = vec4(cur, 1.0);
    return;
  }

  float bsz = max(u_blockSize, 4.0);
  vec2 blockId = floor(uv * u_resolution / bsz);
  vec2 blockUv = (blockId + 0.5) * bsz / u_resolution;
  blockUv = clamp(blockUv, 0.0, 1.0);

  vec3 curBlock = texture(u_texture, blockUv).rgb;
  vec3 histBlock = texture(u_history, blockUv).rgb;

  // Diferencia de movimiento aproximada por bloque.
  float motion = abs(luma(curBlock) - luma(histBlock));
  motion = max(motion, distance(curBlock, histBlock) * 0.5);

  // Umbral: valores altos de threshold => más fácil activar el mosh (menos movimiento requerido).
  float t = mix(0.02, 0.45, clamp(u_motionThreshold, 0.0, 1.0));
  float moshMask = 1.0 - smoothstep(t * 0.35, t, motion);

  // Variación temporal por bloque para que no sea estático.
  float tSlot = floor(u_time * 12.0);
  float rnd = hash(blockId + vec2(tSlot, 7.3));
  float chaos = hash(blockId + vec2(tSlot * 0.37, 19.1));

  // Desplazamiento de bloque desde historial (vectores "simulados").
  vec2 dir = vec2(hash(blockId + vec2(tSlot, 3.1)) - 0.5, hash(blockId + vec2(tSlot, 11.7)) - 0.5);
  dir *= (0.15 + 0.85 * chaos) * u_amount * 0.12;
  vec2 histUv = clamp(uv + dir * (0.5 + rnd), 0.0, 1.0);
  vec3 histSample = texture(u_history, histUv).rgb;

  // En zonas de poco movimiento, prioriza historial (smear/persistencia de macro-bloques).
  float keep = moshMask * mix(0.35, 0.98, u_feedback) * u_amount;

  // Rupturas aleatorias tipo P-frame corrupto dentro de bloques seleccionados.
  float glitch = step(1.0 - u_amount * 0.35, rnd) * moshMask;
  if (glitch > 0.5) {
    vec2 q = floor(histUv * u_resolution / bsz) * bsz / u_resolution;
    histSample = texture(u_history, clamp(q + 0.5 / u_resolution, 0.0, 1.0)).rgb;
    keep = max(keep, u_amount * (0.6 + 0.4 * u_feedback));
  }

  vec3 moshed = mix(cur, histSample, clamp(keep, 0.0, 1.0));

  // Pequeña contaminación cromática en bordes de bloque para look de compresión rota.
  vec2 blockFract = fract(uv * u_resolution / bsz);
  float edge = step(blockFract.x, 0.08) + step(0.92, blockFract.x) + step(blockFract.y, 0.08) + step(0.92, blockFract.y);
  if (edge > 0.0 && keep > 0.05) {
    float shift = (rnd - 0.5) * 0.004 * u_amount;
    vec3 cR = texture(u_history, clamp(histUv + vec2(shift, 0.0), 0.0, 1.0)).rgb;
    vec3 cB = texture(u_history, clamp(histUv - vec2(shift, 0.0), 0.0, 1.0)).rgb;
    moshed = mix(moshed, vec3(cR.r, moshed.g, cB.b), 0.25 * keep);
  }

  fragColor = vec4(clamp(moshed, 0.0, 1.0), 1.0);
}`;function gt(t){const e="precision highp float;";return t.includes(e)?t.replace(e,`${e}
${lt}`):t}const E=ct,bt=ut,xt=ht,_t=dt,St=mt,Et=ft,At=gt(pt),yt=vt;function Tt(t,e){switch(t){case"4:5":return 4/5;case"1:1":return 1;case"16:9":return 16/9;case"9:16":return 9/16;case"original":default:return e.width>0&&e.height>0?e.width/e.height:16/9}}function Rt(t,e,n){if(t==="original"){const s=e.width>0&&e.height>0?e:{width:1280,height:720};return ae(s,n)}const o=Tt(t,e);let r=n.width,a=Math.round(r/o);return a>n.height&&(a=n.height,r=Math.round(a*o)),{width:Math.max(1,r),height:Math.max(1,a)}}const wt=6,Ct=200,Ft=60,kt=30,Ut=5;function V(t){return t instanceof Error?t.message:String(t)}class Dt{constructor(e,n,o={}){this.canvas=e,this.callbacks=o,this.params=ne(n);const r=e.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:!0,powerPreference:"default"});if(r===null)throw new Error("WebGL 2.0 no está disponible en este navegador");this.gl=r,e.addEventListener("webglcontextlost",this.onContextLost,!1),e.addEventListener("webglcontextrestored",this.onContextRestored,!1),this.buildResources()}gl=null;pipeline=null;source=null;programs=[];finalProgram=null;machine=new je;adaptive=new Ce;opticalCenter=_e(.5,.5);params;rafId=null;lastTimestamp=0;lastStatsAt=0;elapsed=0;frame=0;fps=60;fpsSamples=[];contextLost=!1;disposed=!1;pendingCapture=null;recorder=null;recordStream=null;recordChunks=[];recordFormat=null;recordResolve=null;recordReject=null;resumeAfterExport=!1;recordingFullSource=!1;stoppingFullSourceRecording=!1;autoStopTimer=null;buildResources(){const e=this.gl;e!==null&&(e.disable(e.BLEND),e.disable(e.DEPTH_TEST),this.pipeline=new Pe(e,this.canvas.width,this.canvas.height),this.source=new Ie(e),this.programs=[new S(e,E,xt,"image-adjust"),new S(e,E,_t,"digicam"),new S(e,E,St,"vhs"),new S(e,E,At,"brand"),new S(e,E,Et,"compression"),new S(e,E,yt,"datamosh")],this.finalProgram=new S(e,E,bt,"output"),this.contextLost=!1,this.callbacks.onContextChange?.(!1))}onContextLost=e=>{e.preventDefault(),this.contextLost=!0,this.callbacks.onContextChange?.(!0),this.pendingCapture?.reject(new Error("Contexto WebGL perdido durante la exportación")),this.pendingCapture=null,this.recorder!==null&&(this.recordingFullSource=!1,this.stopVideoExport().catch(()=>{}))};onContextRestored=()=>{this.disposeResources();try{this.buildResources(),this.adaptive.reset()}catch(e){this.callbacks.onError?.(`No se pudo recuperar WebGL: ${V(e)}`)}};disposeResources(){this.programs.forEach(e=>e.dispose()),this.programs=[],this.finalProgram?.dispose(),this.finalProgram=null,this.pipeline?.dispose(),this.pipeline=null,this.source?.dispose(),this.source=null}start(){this.disposed||this.rafId!==null||(this.lastTimestamp=performance.now(),this.rafId=requestAnimationFrame(this.loop))}stop(){this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null)}get status(){return this.machine.current}get state(){const e=this.source?.size??{width:0,height:0};return{isPlaying:this.machine.current==="playing",currentTime:this.source?.currentTime??this.elapsed,duration:this.source?.duration??0,resolution:e,fps:this.fps}}setParams(e){this.params=ne(e)}setDigicam(e){this.setParams({...this.params,digicam:{...this.params.digicam,...e}})}setVhs(e){this.setParams({...this.params,vhs:{...this.params.vhs,...e}})}setCompression(e){this.setParams({...this.params,compression:{...this.params.compression,...e}})}setBrand(e){this.setParams({...this.params,brand:{...this.params.brand,...e}})}setDatamosh(e){this.setParams({...this.params,datamosh:{...this.params.datamosh,...e}})}setImageAdjust(e){this.setParams({...this.params,imageAdjust:{...this.params.imageAdjust,...e}})}setOutput(e){this.setParams({...this.params,output:{...this.params.output,...e}}),this.adaptive.reset()}send(e){if(!this.machine.send(e))return!1;switch(e){case"PLAY":this.source?.play();break;case"PAUSE":case"SCRUB_END":case"EXPORT_END":this.source?.pause();break;case"RESET":this.adaptive.reset(),this.source?.pause(),this.source?.loadProcedural(),this.elapsed=0,this.pipeline?.clearHistory();break}return this.emitStats(),!0}async loadFile(e){if(this.source!==null)try{await this.source.loadFile(e),this.machine.current==="error"&&this.machine.reset(),this.pipeline?.clearHistory(),this.send("PLAY"),this.adaptive.reset(),this.renderNow()}catch(n){this.fail(V(n))}}async loadCamera(){if(this.source!==null)try{await this.source.loadCamera(),this.machine.current==="error"&&this.machine.reset(),this.pipeline?.clearHistory(),this.send("PLAY"),this.adaptive.reset(),this.renderNow()}catch(e){this.fail(V(e))}}loadProcedural(){this.source!==null&&(this.source.loadProcedural(),this.machine.current==="error"&&this.machine.reset(),this.pipeline?.clearHistory(),this.send("PAUSE"),this.adaptive.reset())}exportPng(){return this.disposed||this.gl===null||this.contextLost?Promise.reject(new Error("El motor no está listo para exportar PNG")):new Promise((e,n)=>{this.pendingCapture={resolve:e,reject:n}})}isRecording(){return this.recorder!==null}canExportSourceVideo(){return this.source?.isFileVideoSource()===!0}isExportingSourceVideo(){return this.recordingFullSource}getSourcePreviewDuration(){return this.source?.previewDuration??0}getSourceDuration(){return this.source?.duration??0}startVideoExport(e,n){if(this.recorder!==null)throw new Error("Ya hay una grabación en curso");if(this.disposed||this.gl===null)throw new Error("El motor no está listo para grabar");if(typeof this.canvas.captureStream!="function")throw new Error("canvas.captureStream no está disponible en este navegador");const o=Oe(e),r=this.canvas.captureStream(kt);let a;try{a=new MediaRecorder(r,{mimeType:o.mimeType})}catch(s){throw r.getTracks().forEach(l=>l.stop()),s}return this.recordStream=r,this.recordChunks=[],this.recordFormat=o,this.recorder=a,this.recordResolve=null,this.recordReject=null,this.resumeAfterExport=this.machine.current==="playing",n?.resumeAfterExport!==void 0&&(this.resumeAfterExport=n.resumeAfterExport),this.autoStopTimer!==null&&(window.clearTimeout(this.autoStopTimer),this.autoStopTimer=null),a.ondataavailable=s=>{s.data.size>0&&this.recordChunks.push(s.data)},a.onerror=()=>{this.callbacks.onError?.("Error durante la grabación de vídeo")},a.onstop=()=>{this.autoStopTimer!==null&&(window.clearTimeout(this.autoStopTimer),this.autoStopTimer=null);const s=this.recordChunks,l=this.recordFormat??o,c=this.recordResolve,g=this.recordReject,f=this.recordingFullSource;if(this.recordStream?.getTracks().forEach(m=>m.stop()),this.recordStream=null,this.recorder=null,this.recordChunks=[],this.recordFormat=null,this.recordResolve=null,this.recordReject=null,this.recordingFullSource=!1,this.stoppingFullSourceRecording=!1,this.send("EXPORT_END"),f&&this.source!==null&&(this.source.setPreviewLimited(!0),this.source.seek(0)),this.resumeAfterExport?this.send("PLAY"):f&&this.send("PLAY"),this.resumeAfterExport=!1,s.length===0){g?.(new Error("La grabación fue demasiado corta o no se capturaron datos"));return}c?.({blob:new Blob(s,{type:l.mimeType}),format:l})},this.send("EXPORT_START"),a.start(1e3),n?.autoStopMs!==void 0&&(this.autoStopTimer=window.setTimeout(()=>{this.autoStopTimer=null;const s=this.recorder;if(s!==null&&s.state!=="inactive")try{s.stop()}catch{}},n.autoStopMs)),o}async exportSourceVideo(e="mp4"){if(!this.canExportSourceVideo()||this.source===null)throw new Error("No hay un vídeo de archivo cargado para exportar");if(this.recorder!==null)throw new Error("Ya hay una grabación en curso");return this.source.setPreviewLimited(!1),this.source.seek(0),this.machine.reset(),this.send("PLAY"),this.startVideoExport(e,{resumeAfterExport:!0}),this.recordingFullSource=!0,this.stoppingFullSourceRecording=!1,this.source.play(),new Promise((n,o)=>{this.recordResolve=n,this.recordReject=o,this.start()})}async exportCanvasVideo(e,n=Ut){if(this.recorder!==null)throw new Error("Ya hay una grabación en curso");if(this.disposed||this.gl===null)throw new Error("El motor no está listo para exportar");const o=this.machine.current==="playing";return o||(this.machine.current==="error"&&this.machine.reset(),(this.machine.current==="idle"||this.machine.current==="paused")&&this.send("PLAY")),this.startVideoExport(e,{autoStopMs:Math.max(500,Math.round(n*1e3)),resumeAfterExport:o}),this.source?.play(),new Promise((r,a)=>{this.recordResolve=r,this.recordReject=a,this.start()})}async exportVideo(e){return this.canExportSourceVideo()?this.exportSourceVideo(e):this.exportCanvasVideo(e)}stopVideoExport(){const e=this.recorder;return e===null?Promise.reject(new Error("No hay ninguna grabación en curso")):(this.autoStopTimer!==null&&(window.clearTimeout(this.autoStopTimer),this.autoStopTimer=null),new Promise((n,o)=>{if(e.state==="inactive"){o(new Error("La grabación ya había terminado"));return}this.recordResolve=n,this.recordReject=o,e.stop()}))}maybeStopFullSourceRecording(){!this.recordingFullSource||this.stoppingFullSourceRecording||this.recorder===null||this.source===null||this.source.hasReachedSourceEnd()&&(this.stoppingFullSourceRecording=!0,window.setTimeout(()=>{this.recorder!==null&&this.recorder.state!=="inactive"&&this.recorder.stop()},120))}seek(e){this.source?.seek(e)}fail(e){this.machine.send("ERROR"),this.machine.current!=="error"&&(this.machine.reset(),this.machine.send("ERROR")),this.callbacks.onError?.(e),this.emitStats()}loop=e=>{if(this.disposed)return;const n=Math.min(.1,Math.max(0,(e-this.lastTimestamp)/1e3));this.lastTimestamp=e,(this.machine.current==="playing"||this.machine.current==="scrubbing"||this.machine.current==="exporting")&&(this.elapsed+=n),n>0&&(this.fpsSamples.push(1/n),this.fpsSamples.length>Ft&&this.fpsSamples.shift(),this.fps=this.fpsSamples.reduce((o,r)=>o+r,0)/this.fpsSamples.length),this.frame+=1,this.contextLost||this.render(),e-this.lastStatsAt>=Ct&&(this.lastStatsAt=e,this.emitStats()),this.rafId=requestAnimationFrame(this.loop)};renderNow(){this.contextLost||this.render()}render(){const e=this.gl,n=this.pipeline,o=this.source,r=this.finalProgram;if(e===null||n===null||o===null||r===null)return;const a=Rt(this.params.output.aspectRatio,o.size,ee),s=this.adaptive.update(this.fps,a,ee);(this.canvas.width!==s.width||this.canvas.height!==s.height)&&(this.canvas.width=s.width,this.canvas.height=s.height),n.resize(s.width,s.height),o.update(this.elapsed),this.maybeStopFullSourceRecording();let l=o.texture,c=-1;for(let f=0;f<wt;f+=1){c=(c+1)%2;const m=this.programs[f];if(m===void 0)return;n.bindTarget(c),m.use(),f===0?st(m,this.params.imageAdjust,s,o.size):f===1?nt(m,this.params.digicam,this.elapsed,s):f===2?(ot(m,this.params.vhs,this.elapsed,this.frame,s),m.setVec2("u_opticalCenter",this.opticalCenter[0],this.opticalCenter[1])):f===3?it(m,this.params.brand,this.elapsed,s):f===4?rt(m,this.params.compression,this.elapsed,s):(at(m,this.params.datamosh,this.elapsed,s),m.bindTexture("u_history",n.getHistoryTexture(),1)),m.bindTexture("u_texture",l,0),n.renderQuad(),l=n.getTexture(c)}n.bindTarget(null),r.use(),r.bindTexture("u_texture",l,0),n.renderQuad(),n.bindHistoryTarget(),r.use(),r.bindTexture("u_texture",l,0),n.renderQuad();const g=this.pendingCapture;g!==null&&(this.pendingCapture=null,this.canvas.toBlob(f=>{f===null?g.reject(new Error("No se pudo generar el PNG")):g.resolve(f)},Le.mimeType))}emitStats(){const e=this.pipeline?.size??{width:0,height:0};this.callbacks.onStats?.({fps:this.fps,width:e.width,height:e.height,status:this.machine.current,source:this.source?.sourceKind??"procedural"})}dispose(){this.disposed||(this.stop(),this.canvas.removeEventListener("webglcontextlost",this.onContextLost,!1),this.canvas.removeEventListener("webglcontextrestored",this.onContextRestored,!1),this.autoStopTimer!==null&&(window.clearTimeout(this.autoStopTimer),this.autoStopTimer=null),this.recorder!==null&&(this.recorder.onstop=null,this.recorder.state!=="inactive"&&this.recorder.stop(),this.recorder=null),this.recordStream?.getTracks().forEach(e=>e.stop()),this.recordStream=null,this.pendingCapture?.reject(new Error("El motor se ha detenido")),this.pendingCapture=null,this.disposeResources(),this.gl=null,this.disposed=!0)}}let oe=0;function ue(t){return oe+=1,`${t}-${oe}`}function Lt(t){return t.toFixed(2)}function u(t,e,n){const o=ue("slider"),r=document.createElement("div");r.className="control";const a=document.createElement("label");a.htmlFor=o,a.textContent=e.label;const s=document.createElement("output");s.className="control-value";const l=e.format??Lt;s.textContent=l(e.value),s.htmlFor=o;const c=document.createElement("input");c.id=o,c.type="range",c.min=String(e.min),c.max=String(e.max),c.step=String(e.step),c.value=String(e.value),c.title="Doble click para volver al valor inicial";const g=()=>{const m=Number(c.value);s.textContent=l(m),n(m)},f=()=>{c.value=String(e.value),g()};return c.addEventListener("input",g),c.addEventListener("dblclick",f),r.append(a,s,c),t.append(r),{reset:f}}function j(t,e,n){const o=ue("select"),r=document.createElement("div");r.className="control control-select";const a=document.createElement("label");a.htmlFor=o,a.textContent=e.label;const s=document.createElement("select");s.id=o,s.title="Doble click para volver al valor inicial",e.options.forEach(g=>{const f=document.createElement("option");f.value=g.value,f.textContent=g.label,f.selected=g.value===e.value,s.append(f)});const l=()=>{n(s.value)},c=()=>{s.value=e.value,l()};return s.addEventListener("change",l),s.addEventListener("dblclick",c),r.append(a,s),t.append(r),{reset:c}}function Bt(t,e){const n=[],o=document.getElementById("rack-image-adjust"),r=document.getElementById("rack-digicam"),a=document.getElementById("rack-vhs"),s=document.getElementById("rack-compression"),l=document.getElementById("rack-brand"),c=document.getElementById("rack-datamosh");if(o===null||r===null||a===null||s===null||l===null||c===null)throw new Error("No se encontraron los contenedores de los racks");const g=document.createElement("details");g.className="control-dropdown";const f=document.createElement("summary");f.textContent="HSL SATURACIÓN (POR COLOR)";const m=document.createElement("div");m.className="control-dropdown-body",g.append(f,m),n.push(j(o,{label:"FORMATO DE SALIDA",value:t.output.aspectRatio,options:[{value:"original",label:"Libre (original)"},{value:"4:5",label:"4:5"},{value:"1:1",label:"1:1"},{value:"16:9",label:"16:9"},{value:"9:16",label:"9:16"}]},i=>e.setOutput({aspectRatio:i})),u(o,{label:"BRILLO",min:-1,max:1,step:.01,value:t.imageAdjust.brightness},i=>e.setImageAdjust({brightness:i})),u(o,{label:"CONTRASTE",min:-1,max:1,step:.01,value:t.imageAdjust.contrast},i=>e.setImageAdjust({contrast:i})),u(o,{label:"SATURACIÓN",min:-1,max:1,step:.01,value:t.imageAdjust.saturation},i=>e.setImageAdjust({saturation:i}))),o.append(g),n.push(u(m,{label:"ROJOS",min:-1,max:1,step:.01,value:t.imageAdjust.hslSatRed},i=>e.setImageAdjust({hslSatRed:i})),u(m,{label:"NARANJAS",min:-1,max:1,step:.01,value:t.imageAdjust.hslSatOrange},i=>e.setImageAdjust({hslSatOrange:i})),u(m,{label:"AMARILLOS",min:-1,max:1,step:.01,value:t.imageAdjust.hslSatYellow},i=>e.setImageAdjust({hslSatYellow:i})),u(m,{label:"VERDES",min:-1,max:1,step:.01,value:t.imageAdjust.hslSatGreen},i=>e.setImageAdjust({hslSatGreen:i})),u(m,{label:"CIANES",min:-1,max:1,step:.01,value:t.imageAdjust.hslSatCyan},i=>e.setImageAdjust({hslSatCyan:i})),u(m,{label:"AZULES",min:-1,max:1,step:.01,value:t.imageAdjust.hslSatBlue},i=>e.setImageAdjust({hslSatBlue:i})),u(m,{label:"VIOLETAS",min:-1,max:1,step:.01,value:t.imageAdjust.hslSatViolet},i=>e.setImageAdjust({hslSatViolet:i})),u(m,{label:"MAGENTAS",min:-1,max:1,step:.01,value:t.imageAdjust.hslSatMagenta},i=>e.setImageAdjust({hslSatMagenta:i}))),n.push(u(o,{label:"AFILAR IMAGEN",min:0,max:1,step:.01,value:t.imageAdjust.sharpen},i=>e.setImageAdjust({sharpen:i}))),n.push(u(r,{label:"GANANCIA ISO",min:100,max:6400,step:100,value:t.digicam.isoGain,format:i=>`ISO ${i}`},i=>e.setDigicam({isoGain:i})),u(r,{label:"UMBRAL DE FLASH",min:0,max:1,step:.01,value:t.digicam.flashThreshold},i=>e.setDigicam({flashThreshold:i})),u(r,{label:"RADIO DE BLOOM",min:1,max:16,step:1,value:t.digicam.flashBloomRadius,format:i=>`${i} px`},i=>e.setDigicam({flashBloomRadius:i})),u(r,{label:"ABERRACIÓN CROMÁTICA",min:0,max:1,step:.01,value:t.digicam.chromaAberration},i=>e.setDigicam({chromaAberration:i})),u(r,{label:"GRANO POR LUMA",min:0,max:1,step:.01,value:t.digicam.lumaGrain},i=>e.setDigicam({lumaGrain:i})),j(r,{label:"PERFIL DE SENSOR",value:t.digicam.sensorProfile,options:[{value:"sony_ccd_v1",label:"Sony CCD v1"},{value:"early_cmos",label:"CMOS temprano"},{value:"lofi_ccd",label:"Lo-fi CCD"}]},i=>e.setDigicam({sensorProfile:i}))),n.push(u(a,{label:"TRACKING JITTER",min:0,max:1,step:.01,value:t.vhs.trackingJitter},i=>e.setVhs({trackingJitter:i})),u(a,{label:"DISTORSIÓN BARRIL",min:-.5,max:.5,step:.01,value:t.vhs.barrelDistortion},i=>e.setVhs({barrelDistortion:i})),u(a,{label:"RUIDO MAGNÉTICO",min:0,max:1,step:.01,value:t.vhs.magneticNoise},i=>e.setVhs({magneticNoise:i})),u(a,{label:"COLOR BLEED",min:0,max:1,step:.01,value:t.vhs.colorBleed},i=>e.setVhs({colorBleed:i})),u(a,{label:"SCANLINES",min:0,max:1,step:.01,value:t.vhs.scanlineIntensity},i=>e.setVhs({scanlineIntensity:i})),u(a,{label:"Y/C CHROMA DELAY",min:0,max:1,step:.01,value:t.vhs.chromaDelay},i=>e.setVhs({chromaDelay:i})),u(a,{label:"SYNC DRIFT",min:0,max:1,step:.01,value:t.vhs.syncDrift},i=>e.setVhs({syncDrift:i})),u(a,{label:"HEAD SWITCHING",min:0,max:1,step:.01,value:t.vhs.headSwitching},i=>e.setVhs({headSwitching:i})),u(a,{label:"DROPOUTS",min:0,max:1,step:.01,value:t.vhs.dropouts},i=>e.setVhs({dropouts:i})),u(a,{label:"DAÑO DE CINTA",min:0,max:1,step:.01,value:t.vhs.tapeDamage},i=>e.setVhs({tapeDamage:i}))),n.push(u(s,{label:"CALIDAD JPEG",min:.1,max:1,step:.01,value:t.compression.jpegQuality},i=>e.setCompression({jpegQuality:i})),u(s,{label:"TAMAÑO DE BLOQUE",min:4,max:16,step:4,value:t.compression.blockinessSize,format:i=>`${i}×${i} px`},i=>e.setCompression({blockinessSize:i})),u(s,{label:"NIVELES DE POSTERIZACIÓN",min:2,max:16,step:1,value:t.compression.posterizationLevels},i=>e.setCompression({posterizationLevels:i})),u(s,{label:"CORRUPCIÓN DE BLOQUES",min:0,max:1,step:.01,value:t.compression.blockCorruption},i=>e.setCompression({blockCorruption:i})),u(s,{label:"DESPLAZAMIENTO DE BLOQUES",min:0,max:1,step:.01,value:t.compression.blockCorruptionShift},i=>e.setCompression({blockCorruptionShift:i})),j(s,{label:"MATRIZ DE DITHERING",value:t.compression.ditheringType,options:[{value:"bayer_4x4",label:"Bayer 4×4"},{value:"bayer_8x8",label:"Bayer 8×8"},{value:"noise",label:"Ruido"}]},i=>e.setCompression({ditheringType:i})));const M=document.createElement("div");return M.className="brand-swatches",Object.entries(U).forEach(([i,I])=>{const y=document.createElement("span");y.className="brand-swatch",y.style.backgroundColor=I,y.title=`${i} · ${I}`,y.setAttribute("aria-label",`${i} ${I}`),M.append(y)}),l.append(M),n.push(u(l,{label:"INTENSIDAD DEL GRADE",min:0,max:1,step:.01,value:t.brand.gradeAmount},i=>e.setBrand({gradeAmount:i})),u(l,{label:"CRT (MASTER)",min:0,max:1,step:.01,value:t.brand.crtAmount},i=>e.setBrand({crtAmount:i})),u(l,{label:"CURVATURA CRT",min:0,max:1,step:.01,value:t.brand.crtCurvature},i=>e.setBrand({crtCurvature:i})),u(l,{label:"COMPENSACIÓN CURVATURA CRT",min:0,max:1,step:.01,value:t.brand.crtCompensation},i=>e.setBrand({crtCompensation:i})),u(l,{label:"SCANLINES CRT",min:0,max:1,step:.01,value:t.brand.crtScanlines},i=>e.setBrand({crtScanlines:i})),u(l,{label:"MÁSCARA/FÓSFORO",min:0,max:1,step:.01,value:t.brand.crtMask},i=>e.setBrand({crtMask:i})),u(l,{label:"VIÑETA CRT",min:0,max:1,step:.01,value:t.brand.crtVignette},i=>e.setBrand({crtVignette:i})),u(l,{label:"HALACIÓN CRT",min:0,max:1,step:.01,value:t.brand.crtHalation},i=>e.setBrand({crtHalation:i})),u(l,{label:"CONVERGENCIA RGB",min:0,max:1,step:.01,value:t.brand.crtConvergence},i=>e.setBrand({crtConvergence:i})),u(l,{label:"SUCIEDAD",min:0,max:1,step:.01,value:t.brand.dirtAmount},i=>e.setBrand({dirtAmount:i})),u(l,{label:"RAYONES",min:0,max:1,step:.01,value:t.brand.scratchesAmount},i=>e.setBrand({scratchesAmount:i})),u(l,{label:"POLVO",min:0,max:1,step:.01,value:t.brand.dustAmount},i=>e.setBrand({dustAmount:i}))),n.push(u(c,{label:"INTENSIDAD DATAMOSH",min:0,max:1,step:.01,value:t.datamosh.amount},i=>e.setDatamosh({amount:i})),u(c,{label:"UMBRAL DE MOVIMIENTO",min:0,max:1,step:.01,value:t.datamosh.motionThreshold},i=>e.setDatamosh({motionThreshold:i})),u(c,{label:"TAMAÑO DE BLOQUE MOSH",min:4,max:16,step:4,value:t.datamosh.blockSize,format:i=>`${i}×${i} px`},i=>e.setDatamosh({blockSize:i})),u(c,{label:"FEEDBACK TEMPORAL",min:0,max:1,step:.01,value:t.datamosh.feedback},i=>e.setDatamosh({feedback:i}))),{reset:()=>n.forEach(i=>i.reset())}}function v(t){const e=document.getElementById(t);if(e===null)throw new Error(`Elemento #${t} no encontrado`);return e}const Ot=v("viewport"),re=v("status-pill"),D=v("error-message"),Mt=v("context-lost"),q=v("file-input");q.accept=ke;const J=v("timeline-bar"),_=v("timeline"),he=v("time-current"),It=v("time-duration"),de=be();v("brand-mark").src=ie;const B=document.createElement("link");B.rel="icon";B.type="image/png";B.href=ie;document.head.append(B);function H(t){D.textContent=`ERROR: ${t}`,D.hidden=!1}function A(){D.textContent="",D.hidden=!0}function X(t){if(!Number.isFinite(t)||t<0)return"0:00";const e=Math.floor(t),n=Math.floor(e/60),o=e%60;return`${n}:${String(o).padStart(2,"0")}`}function Pt(){if(!p.canExportSourceVideo())return 0;if(p.isExportingSourceVideo())return p.getSourceDuration();const t=p.getSourcePreviewDuration();return t>0?t:p.getSourceDuration()}let L=!1,me=!1;function Y(){const t=Pt(),e=t>.01;if(J.hidden=!e,!e){requestAnimationFrame(Y);return}const n=p.state,o=Math.max(0,Math.min(t,n.currentTime));_.max!==String(t)&&(_.max=String(t)),L||(_.value=String(o),he.textContent=X(o)),It.textContent=X(t),_.disabled=p.isRecording(),requestAnimationFrame(Y)}function Nt(t){re.textContent=t.status.toUpperCase(),re.dataset.status=t.status}let p;try{p=new Dt(Ot,de,{onStats:Nt,onError:H,onContextChange:t=>{Mt.hidden=!t}})}catch(t){throw H(t instanceof Error?t.message:String(t)),t}const Vt=Bt(de,p);v("btn-play").addEventListener("click",()=>{A(),p.send("PLAY")});v("btn-pause").addEventListener("click",()=>{p.send("PAUSE")});v("btn-reset").addEventListener("click",()=>{A(),Vt.reset(),p.send("RESET")});q.addEventListener("change",()=>{const t=q.files?.[0];t!==void 0&&(A(),p.loadFile(t))});_.addEventListener("pointerdown",()=>{J.hidden||_.disabled||(L=!0,me=p.status==="playing",p.send("SCRUB_START"))});_.addEventListener("input",()=>{if(J.hidden)return;const t=Number(_.value);Number.isFinite(t)&&(p.seek(t),he.textContent=X(t))});const Q=()=>{L&&(L=!1,p.send("SCRUB_END"),me&&p.send("PLAY"))};_.addEventListener("change",Q);_.addEventListener("pointerup",Q);_.addEventListener("pointercancel",Q);const R=v("btn-export-png"),w=v("btn-export-video"),fe=v("video-export-chooser"),F=v("btn-format-mp4"),k=v("btn-format-webm"),T=v("btn-export-confirm"),W=v("btn-export-cancel");function K(t){H(t instanceof Error?t.message:String(t))}function pe(t,e){const n=new Date,o=l=>String(l).padStart(2,"0"),r=`${n.getFullYear()}${o(n.getMonth()+1)}${o(n.getDate())}-${o(n.getHours())}${o(n.getMinutes())}${o(n.getSeconds())}`,a=URL.createObjectURL(t),s=document.createElement("a");s.href=a,s.download=`idovhs-${r}.${e}`,document.body.append(s),s.click(),s.remove(),window.setTimeout(()=>URL.revokeObjectURL(a),1e3)}let ve=null,C=!1;function O(t){ve=t,F.setAttribute("aria-pressed",t==="mp4"?"true":"false"),k.setAttribute("aria-pressed",t==="webm"?"true":"false"),T.disabled=t===null}function ge(){fe.hidden=!0,w.hidden=!1,w.disabled=!1,w.textContent="EXPORTAR VIDEO",O(null)}function jt(){if(C||p.isRecording())return;const t=Be();if(t.length===0){K("La grabación de vídeo no está disponible en este navegador");return}F.disabled=!t.includes("mp4"),k.disabled=!t.includes("webm"),O(null),w.hidden=!0,fe.hidden=!1}R.addEventListener("click",()=>{A(),R.disabled=!0,p.exportPng().then(t=>pe(t,"png")).catch(K).finally(()=>{R.disabled=!1})});w.addEventListener("click",()=>{A(),jt()});F.addEventListener("click",()=>{F.disabled||O("mp4")});k.addEventListener("click",()=>{k.disabled||O("webm")});W.addEventListener("click",()=>{C||(A(),ge())});T.addEventListener("click",()=>{A();const t=ve;t===null||C||(C=!0,R.disabled=!0,T.disabled=!0,W.disabled=!0,F.disabled=!0,k.disabled=!0,T.textContent="EXPORTANDO…",p.exportVideo(t).then(({blob:e,format:n})=>pe(e,n.extension)).catch(K).finally(()=>{C=!1,R.disabled=!1,W.disabled=!1,T.textContent="CONFIRMAR",ge()}))});p.send("PLAY");p.start();requestAnimationFrame(Y);window.addEventListener("beforeunload",()=>p.dispose());"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})});
