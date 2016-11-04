require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

let imageDatas = require('../data/imageData.json');

imageDatas = (function( imageDatas ) {
    return imageDatas.map(function( item ) {
      item.imgUrl = require(`../images/${item.fileName}`);
      return item;
    })
})(imageDatas);

function getRangeRandom(low, high) {
    return Math.ceil(Math.random() * (high - low) + low);
}

function get30DegRandom() {
  return ((Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30));
}
class ControllerUnit extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick= this.handleClick.bind(this);
  }

  handleClick(e) {
    if( this.props.arrange.isCenter ){
      this.props.inverse();
    }else {
      this.props.center();
    }
    e.preventDefault();
    e.stopPropagation();
  }
  render() {
    let controlelrUnitClassName = 'controller-unit';
    if (this.props.arrange.isCenter) {
        controlelrUnitClassName += ' is-center'
        if (this.props.arrange.isInverse) {
            controlelrUnitClassName += ' is-inverse'
        }
    }
    return (<span className={controlelrUnitClassName} onClick={this.handleClick}></span>)
  }
}

class ImgFigure extends React.Component {

    constructor(props) {
      super(props);
      this.handleClick= this.handleClick.bind(this);
    }

    handleClick(e) {
      if (this.props.arrange.isCenter) {
        this.props.inverse();
      } else {
        this.props.center();
      }

      e.stopPropagation();
      e.preventDefault();
    }

    render() {
        let styleObj = {};

        if (this.props.arrange.pos) {
            styleObj = this.props.arrange.pos;
        }

        if (this.props.arrange.rotate) {
          (['MozTransform', 'msTransform', 'WebkitTransform', 'transform']).forEach(function (value) {
            styleObj[value] = 'rotate(`${this.props.arrange.rotate}deg`)';
          }.bind(this));
        }

        if (this.props.arrange.isCenter) {
          styleObj.zIndex = 9;
        }

        let imgFigureClassName = 'img-figure';
            imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';

        return (
            <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
                <img src={this.props.data.imgUrl}
                     alt={this.props.data.title}
                />
                <figcaption>
                    <h2 className="img-title">{this.props.data.title}</h2>
                    <div className="img-back" onClick={this.handleClick}>
                      <p>
                        {this.props.data.desc}
                      </p>
                    </div>
                </figcaption>
            </figure>
        );
    }
}


class AppComponent extends React.Component {
  constructor( props ) {
    super( props );
    this.Constant = {
      centerPos: {
        left: 0,
        right: 0
      },
      hPosRange: {
        leftSecX: [0,0],
        rightSecX: [0,0],
        y: [0,0]
      },
      vPosRange: {
        x: [0,0],
        topY: [0,0]
      }
    };
    this.state = {
      imgsArrangeArr: []
    }
  }

  center( index ) {
    return function() {
      this.rearrange( index );
    }.bind(this);
  }

  //翻转图片
  inverse( index ) {
    return function () {
      let imgsArrangeArr = this.state.imgsArrangeArr;

      imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;

      this.setState({
        imgsArrangeArr: imgsArrangeArr
      });
    }.bind(this);
  }
  // 重新布局
  rearrange( centerIndex ) {
    let imgsArrangeArr = this.state.imgsArrangeArr,
        Constant = this.Constant,
        centerPos = Constant.centerPos,
        hPosRange = Constant.hPosRange,
        vPosRange = Constant.vPosRange,
        hPosRangeLeftSecX = hPosRange.leftSecX,
        hPosRangeRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,
        vPosRangeTopY = vPosRange.topY,
        vPosRangeX = vPosRange.x,

        //存放上部分区域的图片的位置信息
        imgsArrangeTopArr = [],
        topImgNum = Math.floor(Math.random() * 2),
        topImgSpliceIndex = 0,

        //从数组中取出并剔除中心图片的信息，返回一个数组
        imgsArrangeCenterArr = imgsArrangeArr.splice( centerIndex, 1 );

        //居中 centerIndex 的图片
        imgsArrangeCenterArr[0] = {
          pos: centerPos,
          rotate: 0,
          isCenter: true
        },

        topImgSpliceIndex = Math.floor(Math.random() * (imgsArrangeArr.length - topImgNum)),
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum),
        // 上
        imgsArrangeTopArr.forEach(function( value,index ){

          imgsArrangeTopArr[index] = {
              pos: {
                  top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
                  left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
              },
              rotate: get30DegRandom(),
              isCenter: false
            };
        });
        //左右两侧
        for( let i = 0,j = imgsArrangeArr.length, k = j / 2; i< j; i++ ) {
          let hPosRangeLORX = null;
          hPosRangeLORX = i < k ? hPosRangeLeftSecX: hPosRangeRightSecX;
          imgsArrangeArr[i] = {
            pos: {
              top: getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
              left: getRangeRandom(...hPosRangeLORX)
            },
            rotate: get30DegRandom(),
            isCenter: false
          }
        }

        if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
            imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
        }
        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);
        this.setState({
          imgsArrangeArr
        });


  }
  //钩子函数，render之后执行
  componentDidMount() {
    let stageDOM = ReactDOM.findDOMNode( this.refs.stage ),
        stageW = stageDOM.scrollWidth,
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.ceil( stageW / 2),
        halfStageH = Math.ceil( stageH / 2);

    let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
      imgW = imgFigureDOM.scrollWidth,
      imgH = imgFigureDOM.scrollHeight,
      halfImgW = Math.ceil(imgW / 2),
      halfImgH = Math.ceil(imgH / 2);

    this.Constant.centerPos = {
      left: halfStageW - halfImgW,
      top: halfStageH - halfImgH
    };
    this.Constant.hPosRange.leftSecX[0] = -halfImgW;
    this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
    this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
    this.Constant.hPosRange.y[0] = -halfImgH;
    this.Constant.hPosRange.y[1] = stageH - halfImgH;


    this.Constant.vPosRange.topY[0] = -halfImgH;
    this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
    this.Constant.vPosRange.x[0] = halfStageW - imgW;
    this.Constant.vPosRange.x[1] = halfStageW;

    this.rearrange(0);

  }
  render() {

  let controllerUnits = [],
        imgFigures = [];

    imageDatas.forEach(function (value, index) {

        if (!this.state.imgsArrangeArr[index]) {
            this.state.imgsArrangeArr[index] = {
                pos: {
                    left: 0,
                    top: 0
                },
                rotate: 0,
                isInverse: false,
                isCenter: false
            };
        }

        imgFigures.push(<ImgFigure key={index} data={value} ref={'imgFigure' + index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);

        controllerUnits.push(<ControllerUnit key={index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);
    }.bind(this));
    return (
      <section className="stage" ref="stage">
        <section className="img-section">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          { controllerUnits }
        </nav>
      </section>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
