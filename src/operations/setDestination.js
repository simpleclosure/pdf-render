const setDestination = (ctx, node) => {
  if (node.props?.id) {
    ctx.addNamedDestination(
      node.props.id,
      'XYZ',
      ctx._ctm[4] + node.box.left,
      ctx._ctm[5] - node.box.top,
      null,
    );
  }
};

export default setDestination;
