const crypto = require('crypto');

// Hash function using SHA-256
function hash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Generate Merkle root and tree
function generateMerkleTree(addresses) {
  if (addresses.length === 0) return null;

  // Hash each address to create leaf nodes
  let leafNodes = addresses.map(addr => hash(addr));
  const tree = [leafNodes];

  // Recursively calculate parent nodes
  while (leafNodes.length > 1) {
    const tempNodes = [];
    for (let i = 0; i < leafNodes.length; i += 2) {
      if (i + 1 < leafNodes.length) {
        tempNodes.push(hash(leafNodes[i] + leafNodes[i + 1]));
      } else {
        // If odd, move the last node to the next level
        tempNodes.push(leafNodes[i]);
      }
    }
    leafNodes = tempNodes;
    tree.push(leafNodes);
  }

  return { root: leafNodes[0], tree };
}

// Generate proof for a specific leaf
function generateProof(address, tree) {
  const hashedLeaf = hash(address);
  const proof = [];
  let index = tree[0].indexOf(hashedLeaf);

  if (index === -1) throw new Error('Leaf not found in the tree.');

  for (let level = 0; level < tree.length - 1; level++) {
    const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;

    if (siblingIndex < tree[level].length) {
      proof.push(tree[level][siblingIndex]);
    }

    index = Math.floor(index / 2);
  }

  return proof;
}

// Verify a leaf in the Merkle tree
function verifyMerkleProof(leaf, proof, root) {
  let computedHash = hash(leaf);

  for (const sibling of proof) {
    computedHash = hash(computedHash + sibling);
  }

  return computedHash === root;
}

// Example usage
const addresses = [
  '0x123456789abcdef123456789abcdef123456789a',
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  '0x789abcdef789abcdef789abcdef789abcdef789ab',
  '0xfedcbafedcbafedcbafedcbafedcbafedcbafedc',
  '0xabcdef123456789abcdef123456789abcdef1234',
];

// Generate Merkle root and tree
const { root, tree } = generateMerkleTree(addresses);

// Print the Merkle tree
console.log('Merkle Tree Structure:');
tree.forEach((level, index) => {
  console.log(`Level ${index}:`, level);
});

// Generate proof for the first address
const proof = generateProof(addresses[0], tree);
console.log('\nProof for first address:', proof);

// Verify the first address
const isValid = verifyMerkleProof(addresses[0], proof, root);
console.log('\nVerification Result:', isValid);
