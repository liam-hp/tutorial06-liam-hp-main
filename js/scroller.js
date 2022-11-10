/**
 * This code provides the basic event management for our narrative visualization.
 * 
 * It is a somewhat simplified and updated version of Jim Vallandingham's code that
 * went with his article "So You Want to Build A Scroller" 
 * (https://vallandingham.me/scroller.html)
 * 
 * Usage:
 * 
 * const scroll = scroller();
 * scroll(d3.selectAll("section"));
 * scroll.on("section-change", (section)=>{});
 * 
 */

 function scroller(){

  const dispatch = d3.dispatch("section-change"); 
  const sectionPositions = [];
  let currentSection;
  let sections;

  /**
   * This is an event handler for resize events.
   * It is calculating the starting position of each section.
   */
  const resize = ()=>{
    // clear out the array
    sectionPositions.splice(0, sectionPositions.length);

    let start;
    sections.each(function(d,i){
      const pos = this.getBoundingClientRect().top;
      if (i === 0){
        start = pos;
      }
      sectionPositions.push(pos-start);
    });


  }

  /**
   * This is an event handler that listens for scroll events.
   * Its main job is figuring out which section is currently being viewed.
   */
  const position=()=>{
    let sectionIndex = d3.bisect(sectionPositions, scrollY-50); // eslint-disable-line no-restricted-globals
    sectionIndex = Math.min(sectionIndex, sectionPositions.length -1);

    if (sectionIndex !== currentSection){
      dispatch.call("section-change", this, sectionIndex);
      currentSection = sectionIndex;
    }
    
  }


  function scroll(steps){
    sections = steps;

    d3.select(window)
      .on('scroll.scroller', position)
      .on('resize.scroller', resize);

    resize();


    const timer = d3.timer(function () {
      position();
      timer.stop();
    });
  
  }

  scroll.on = (action, callback)=>{
    dispatch.on(action, callback);

  }



  return scroll;
  }